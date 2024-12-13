import { stateManager } from "@/lib/state";
import { Transition } from "@/lib/transition";

// Define the types for the virtual DOM nodes
export type VNode =
    | VElement
    | string
    | number
    | null
    | undefined
    | Promise<VNode>
    | VNode[];

// Updated VElement interface
export interface VElement {
    type: string | FunctionComponent | ComponentClass | FragmentType;
    props: Props | null;
    children: VNode[];
}

// Fragment symbol
export const Fragment = Symbol("Fragment");
export type FragmentType = typeof Fragment;

// Define base HTML attributes similar to React's approach
export interface HTMLAttributes extends Record<string, any> {
    className?: string;
    id?: string;
    style?: Partial<CSSStyleDeclaration> | string;
    role?: string;
    tabIndex?: number;
    ref?: ((el: HTMLElement) => void) | { current: HTMLElement | null };
    transitionEnter?: () => void;
    transitionExit?: () => void;
    onMount?: (el: HTMLElement) => void; // Support for onMount lifecycle event
}

// Event handlers
type EventHandlers = {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
};

// Combine HTML attributes with event handlers
type Props = HTMLAttributes & {
    [K in keyof EventHandlers as `on${Capitalize<K>}`]?: EventHandlers[K];
};

// Props with children
export interface PropsWithChildren extends Props {
    children?: VNode[];
}

// Functional component type
export type FunctionComponent = (props: PropsWithChildren) => VNode;

// Component class type
export type ComponentClass = new (props: PropsWithChildren) => Component;

// JSX namespace for TypeScript support
declare global {
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
}

// Suspense component
export interface SuspenseProps extends Props {
    fallback: VNode;
    children: VNode | Promise<VNode> | VNode[] | undefined;
}

export const Suspense: FunctionComponent = ({ fallback, children }) => {
    if (children instanceof Promise) {
        return fallback;
    }
    return children;
};

// The base Component class
export class Component {
    props: PropsWithChildren;
    stateKey: string;

    constructor(props: PropsWithChildren) {
        this.props = props;
        this.stateKey = crypto.randomUUID();
    }

    async init() {
        if (typeof (this as any).initialState === "function") {
            const initialState = (this as any).initialState();
            await stateManager.set(this.stateKey, initialState);
        }
    }

    setState(partialState: Partial<object>) {
        return stateManager.update(this.stateKey, partialState);
    }

    async getState<T = object>(): Promise<T> {
        return await stateManager.get(this.stateKey) as T;
    }

    render(): VNode {
        return null;
    }
}

// The JSX factory function
export const jsx = (
    type: string | FunctionComponent | ComponentClass | FragmentType,
    props: Props | null,
    ...children: VNode[]
): VNode => {
    const { key, ...restProps } = props ?? {};
    return {
        type,
        props: { ...restProps, key },
        children,
    };
};

const nodeToVNode = (node: ChildNode): VNode => {
    if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent ?? "";
    }
    if (node instanceof Element) {
        return jsx(
            node.tagName.toLowerCase(),
            null,
            ...Array.from(node.childNodes).map(nodeToVNode)
        );
    }
    return "";
};

export const html = (
    strings: TemplateStringsArray,
    ...values: any[]
): VNode => {
    const template = strings.reduce(
        (acc, str, i) => acc + str + (values[i] || ""),
        "",
    );

    const templateElement = document.createElement("template");
    templateElement.innerHTML = template.trim();

    const children = Array.from(templateElement.content.childNodes).map(nodeToVNode);
    return jsx(Fragment, null, ...children);
};


// Renderer function to mount the virtual DOM to the actual DOM
export const render = async (
    vnode: VNode,
    container: Element | DocumentFragment,
) => {
    console.log("render", vnode, container);
    // Ensure state manager is initialized
    await stateManager.init();

    // Create new DOM node
    const newDom = await diff(null, vnode);

    // Clear the container
    if (container instanceof Element) {
        container.innerHTML = '';
    } else {
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
    }

    // Append the new DOM node
    container.appendChild(newDom);
};

const handlePromise = async (vnode: Promise<VNode>, dom: Node | null) => {
    const fallbackVNode = jsx(
        Suspense,
        { fallback: jsx("div", null, "Loading...") },
        null,
    );
    const fallbackDom = await diff(dom, fallbackVNode);

    return vnode
        .then(async resolvedVNode => {
            const finalDom = await diff(fallbackDom, resolvedVNode);
            if (fallbackDom.parentNode) {
                fallbackDom.parentNode.replaceChild(finalDom, fallbackDom);
            }
            return finalDom;
        })
        .catch(error => {
            console.error("Error during Suspense:", error);
            return document.createTextNode("Error loading component");
        });
};

const handleStringOrNumber = async (vnode: string | number, dom: Node | null) => {
    // Text node
    const newText = String(vnode);
    if (dom && dom.nodeType === Node.TEXT_NODE) {
        if (dom.textContent !== newText) {
            dom.textContent = newText;
        }
        return dom;
    } else {
        const newDom = document.createTextNode(newText);
        if (dom?.parentNode) {
            dom.parentNode.replaceChild(newDom, dom);
        }
        return newDom;
    }
};

const handleArray = async (vnode: VNode[], dom: Node | null) => {
    const fragment = document.createDocumentFragment();
    for (const child of vnode) {
        fragment.appendChild(await diff(null, child));
    }
    if (dom?.parentNode) {
        dom.parentNode.replaceChild(fragment, dom);
    }
    return fragment;
};

const handleFunction = async (element: VElement, dom: Node | null) => {
    // Component
    let componentVNode: VNode;

    if (typeof element.type === "function" &&
        (element.type as ComponentClass).prototype?.render) {
        // Class-based component
        const componentInstance = new (element.type as ComponentClass)({
            ...element.props,
            children: element.children,
        });

        const stateKey = componentInstance.stateKey;

        // Subscribe to state changes
        stateManager.subscribe(stateKey, async () => {
            // Re-render when state changes
            const newVNode = componentInstance.render();
            const newDom = await diff(dom, newVNode);
            if (dom?.parentNode && newDom !== dom) {
                dom.parentNode.replaceChild(newDom, dom);
            }
        });

        componentVNode = componentInstance.render();
    } else {
        // Functional component
        componentVNode = (element.type as FunctionComponent)({
            ...element.props,
            children: element.children,
        });
    }
    return await diff(dom, componentVNode);
};

const handleFragment = async (element: VElement, dom: Node | null) => {
    // Fragment
    const fragment = document.createDocumentFragment();
    for (const child of element.children) {
        fragment.appendChild(await diff(null, child));
    }
    if (dom?.parentNode) {
        dom.parentNode.replaceChild(fragment, dom);
    }
    return fragment;
};

// Diffing and patching function
const diff = async (dom: Node | null, vnode: VNode): Promise<Node> => {
    console.log("diff", dom, vnode);
    try {
        if (vnode === null || vnode === undefined) {
            return document.createTextNode("");
        }

        if (vnode instanceof Promise) {
            return await handlePromise(vnode, dom);
        }

        if (typeof vnode === "string" || typeof vnode === "number") {
            return await handleStringOrNumber(vnode, dom);
        }

        if (Array.isArray(vnode)) {
            return await handleArray(vnode, dom);
        }

        const element = vnode;

        if (typeof element.type === "function") {
            return await handleFunction(element, dom);
        }

        if (element.type === Fragment) {
            return await handleFragment(element, dom);
        }

        console.log("element", element);

        // Element node
        if (
            !dom ||
            !(dom instanceof Element) ||
            dom.nodeName.toLowerCase() !== element.type.toLowerCase()
        ) {
            // Create new DOM node
            const newDom = await createElement(element);
            if (dom?.parentNode) {
                dom.parentNode.replaceChild(newDom, dom);
            }
            return newDom;
        } else {
            // Update existing DOM node
            updateProps(dom, element.props ?? {}, (dom as any)._prevProps || {});
            (dom as any)._prevProps = element.props;
            // Diff children
            await diffChildren(dom, element.children);
            return dom;
        }
    } catch (error) {
        console.error("Error during diffing and patching:", error);
        // Optionally, create an error boundary or display an error UI
        return document.createTextNode("Error rendering component");
    }
};

// Create a DOM element from a virtual node
const createElement = async (vnode: VElement): Promise<Element> => {
    const { type, props, children } = vnode;
    let element: Element;
    if (SVG_ELEMENTS.has((type as string).toLowerCase())) {
        element = document.createElementNS(SVG_NAMESPACE, type as string);
    } else {
        element = document.createElement(type as string);
    }
    updateProps(element, props ?? {});
    handleSpecialProps(element, props);
    for (const child of children) {
        element.appendChild(await diff(null, child));
    }
    return element;
};


// Update props on a DOM element
const updateProps = (
    element: Element,
    newProps: Props,
    oldProps: Props = {},
) => {
    // Iterate over new props
    for (const name in newProps) {
        if (name === "children") continue; // children are handled separately

        if (newProps[name] !== oldProps[name]) {
            setProp(element, name, newProps[name]);
        }
    }


    // Remove old props that are not present in new props
    for (const name in oldProps) {
        if (!(name in newProps)) {
            removeProp(element, name);
        }
    }
};


// Set a property on a DOM element
const setProp = (element: Element, name: string, value: any) => {
    if (name.startsWith("on") && typeof value === "function") {
        // Use the new event delegation system by adding the function to the attribute
        element.setAttribute(name, value);
        initializeEventType(name.substring(2).toLowerCase());
        return;
    }

    if (handleEventAndRef(element, name, value)) {
        return;
    }

    if (name === "style") {
        setStyle(element, value);
    } else if (name === "className" || name === "class") {
        setClass(element, value);
    } else if (typeof value === "boolean") {
        if (value) {
            element.setAttribute(name, "");
        } else {
            element.removeAttribute(name);
        }
    } else {
        element.setAttribute(name, String(value));
    }
};


// Remove a property from a DOM element
const removeProp = (element: Element, name: string) => {
    element.removeAttribute(name);
};


// Set styles on an element
const setStyle = (
    element: Element,
    styles:
        | string
        | Partial<CSSStyleDeclaration>
        | Array<Partial<CSSStyleDeclaration>>,
) => {
    if (typeof styles === "string") {
        (element as HTMLElement).style.cssText = styles;
    } else if (Array.isArray(styles)) {
        styles.forEach((styleObj) => {
            Object.assign((element as HTMLElement).style, styleObj);
        });
    } else if (typeof styles === "object" && styles !== null) {
        Object.assign((element as HTMLElement).style, styles);
    }
};


// Set class on an element
const setClass = (
    element: Element,
    value: string | string[] | { [key: string]: boolean },
) => {
    if (typeof value === "string") {
        (element as HTMLElement).className = value;
    } else if (Array.isArray(value)) {
        (element as HTMLElement).className = value.filter(Boolean).join(" ");
    } else if (typeof value === "object" && value !== null) {
        (element as HTMLElement).className = Object.entries(value)
            .filter(([_, enabled]) => enabled)
            .map(([className]) => className)
            .join(" ");
    }
};


// Handle special props like events and refs
const handleEventAndRef = (
    element: Element,
    name: string,
    value: any,
): boolean => {
    if (name === "ref") {
        if (typeof value === "function") {
            value(element);
        } else if (typeof value === "object" && value !== null) {
            value.current = element;
        }
        return true;
    }

    return false;
};

// Handle special props that need to be applied once element is in the DOM
const handleSpecialProps = (element: Element, props?: Props | null) => {
    if (!props) return;

    // Handle onMount lifecycle event
    if (props.onMount && typeof props.onMount === "function") {
        requestAnimationFrame(() => {
            if (element.isConnected) {
                props.onMount!(element as HTMLElement);
            } else {
                const observer = new MutationObserver((_, obs) => {
                    if (element.isConnected) {
                        requestAnimationFrame(() => props.onMount!(element as HTMLElement));
                        obs.disconnect();
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }
        });
    }


    // Handle transitions
    if (props.transitionEnter || props.transitionExit) {
        Transition(element, {
            enter: props.transitionEnter || (() => { }),
            exit: props.transitionExit || (() => { }),
        });
    }
};

// Categorize nodes by key
const categorizeNodes = (nodes: Element[]) => {
    const keyedNodes = new Map<string | number, Element>();
    const nonKeyedNodes: Element[] = [];

    nodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const key = node.getAttribute("key");
            if (key !== null) {
                keyedNodes.set(key, node);
            } else {
                nonKeyedNodes.push(node);
            }
        }
    });
    return { keyedNodes, nonKeyedNodes };
};

// Categorize VNodes by key
const categorizeVNodes = (vnodes: VNode[]) => {
    const keyedVNodes = new Map<string | number, VNode>();
    const nonKeyedVNodes: VNode[] = [];

    for (const vnode of vnodes) {
        if (isVElement(vnode) && vnode.props?.key != null) {
            keyedVNodes.set(vnode.props.key, vnode);
        } else {
            nonKeyedVNodes.push(vnode);
        }
    }
    return { keyedVNodes, nonKeyedVNodes };
};

// Diff and update children
const diffChildren = async (parent: Element, vchildren: VNode[]) => {
    const domChildren = Array.from(parent.childNodes) as Element[];
    const { keyedNodes: keyedDomNodes, nonKeyedNodes: nonKeyedDomNodes } = categorizeNodes(domChildren);
    const { keyedVNodes, nonKeyedVNodes } = categorizeVNodes(vchildren);

    // Update keyed VNodes
    for (const [key, vnode] of keyedVNodes) {
        const domChild = keyedDomNodes.get(key);
        if (domChild) {
            const newDomChild = await diff(domChild, vnode);
            if (newDomChild !== domChild) {
                parent.replaceChild(newDomChild, domChild);
            }
            keyedDomNodes.delete(key);
        } else {
            parent.appendChild(await diff(null, vnode));
        }
    }

    // Update non-keyed VNodes
    for (let i = 0; i < nonKeyedVNodes.length; i++) {
        const vnode = nonKeyedVNodes[i];
        const domChild = nonKeyedDomNodes[i];
        const newDomChild = await diff(domChild || null, vnode);
        if (!domChild) {
            parent.appendChild(newDomChild);
        } else if (newDomChild !== domChild) {
            parent.replaceChild(newDomChild, domChild);
        }
    }

    // Remove remaining DOM nodes
    keyedDomNodes.forEach((domChild) => parent.removeChild(domChild));
    nonKeyedDomNodes
        .slice(nonKeyedVNodes.length)
        .forEach((domChild) => parent.removeChild(domChild));
};

// Helper function to check if a VNode is a VElement
const isVElement = (vnode: VNode): vnode is VElement => {
    return typeof vnode === "object" && vnode !== null && "type" in vnode;
};


// Add event listeners once
const initializedEvents = new Set<string>();
const initializeEventType = (eventName: string) => {
    if (!initializedEvents.has(eventName)) {
        document.addEventListener(eventName, delegateHandler(eventName));
        initializedEvents.add(eventName);
    }
};

const delegateHandler = (eventName: string) => (event: Event) => {
    let target = event.target as Element | null;

    while (target) {
        const handler = target.getAttribute(`on${eventName}`);
        if (handler && typeof (handler as any) === "function") {
            (handler as any)(event);
        }
        target = target.parentElement;
    }
};

// SVG elements set
const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const SVG_ELEMENTS = new Set([
    "svg",
    "path",
    "circle",
    "line",
    "marker",
    "defs",
    "clippath",
    "g",
    "text",
    "rect",
    "polygon",
    "polyline",
    "ellipse",
    "foreignObject",
    "image",
    "pattern",
    "mask",
    "use",
    "animate",
    "animateMotion",
    "animateTransform",
    "clipPath",
    "linearGradient",
    "radialGradient",
    "stop",
    "symbol",
    "textPath",
    "tspan",
]);

//Error Boundary
export interface ErrorBoundaryProps extends Props {
    fallback?: VNode | ((error: Error) => VNode);
    handleError?: (error: Error) => void;
}

export class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    componentDidCatch(error: Error) {
        console.error("Error caught by ErrorBoundary:", error);
        this.setState({ hasError: true, error });

        if (this.props.handleError) {
            this.props.handleError(error);
        }
    }

    render() {
        if (this.state.hasError) {
            if (typeof this.props.fallback === "function") {
                return this.props.fallback(this.state.error);
            }
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return jsx("div", { className: "error" }, "Something went wrong.");
        }

        return this.props.children;
    }
}

// Function to start the app
export const renderApp = async (
    vnode: VNode,
    container: Element | DocumentFragment,
) => {
    await render(vnode, container);
};