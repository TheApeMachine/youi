// @ts-ignore: JSX factory import is used by the transpiler
import { Transition } from "@/lib/transition";

/*
html is a function that takes a TemplateStringsArray and any number of values and returns a DocumentFragment.
@param strings The TemplateStringsArray to render.
@param values The values to render.
@returns A DocumentFragment containing the rendered TemplateStringsArray and values.
*/
export const html = (strings: TemplateStringsArray, ...values: any[]): DocumentFragment => {
    const template = document.createElement("template");

    const htmlString = strings.reduce((result, string, i) => {
        let value = values[i];

        // Handle arrays
        if (Array.isArray(value)) {
            return `${result}${string}${value.join("")}`;
        }

        // Handle DocumentFragments
        if (value instanceof DocumentFragment) {
            return `${result}${string}`;
        }

        // Handle strings and other values
        return `${result}${string}${options.sanitize ? sanitizeHTML(value) : value}`;
    }, "");

    template.innerHTML = htmlString.trim();
    const fragment = document.importNode(template.content, true);

    return fragment;
};

/* Define the options object with necessary properties */
const options = {
    eventPrefix: 'event-', // Prefix for event attributes
    sanitize: true // Enable HTML sanitization
};

/*
sanitizeHTML is a function that takes a string and returns a sanitized string.
@param str The string to sanitize.
@returns A sanitized string.
*/
export const sanitizeHTML = (html: string): string => {
    // Basic HTML sanitization
    return html.replace(/<(?!\/?(p|br|b|i|em|strong)\b)[^>]+>/gi, '')
               .replace(/javascript:/gi, '')
               .trim();
};

// Add Fragment type and export
export const Fragment = Symbol('Fragment');
export type FragmentType = typeof Fragment;

type JSXElementType = string | Function | typeof Fragment;

// Define base HTML attributes similar to React's approach
export interface HTMLAttributes extends Record<string, any> {
    className?: string;
    id?: string;
    style?: Partial<CSSStyleDeclaration> | string;
    role?: string;
    tabIndex?: number;
    ref?: ((el: HTMLElement) => void) | { current: HTMLElement | null }; // Added `ref` prop
}

// Update event handler types to be more specific
type EventHandlers = {
    [K in keyof HTMLElementEventMap]?: (event: HTMLElementEventMap[K]) => void;
};

// Combine HTML attributes with event handlers for our final Props type
type Props = HTMLAttributes & {
    [K in keyof EventHandlers as `on${Capitalize<K>}`]?: EventHandlers[K];
};

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';

// Comprehensive list of SVG elements
const SVG_ELEMENTS = new Set([
    'svg', 'path', 'circle', 'line', 'marker', 'defs',
    'clippath', 'g', 'text', 'rect', 'polygon', 'polyline',
    'ellipse', 'foreignObject', 'image', 'pattern', 'mask',
    'use', 'animate', 'animateMotion', 'animateTransform',
    'clipPath', 'linearGradient', 'radialGradient', 'stop',
    'symbol', 'textPath', 'tspan'
]);

const handleSVG = (tag: string): { element: Element, isSVG: boolean } => {
    const tagLower = tag.toLowerCase();
    // Track SVG context through the tree
    const isSVG = tagLower === 'svg' || SVG_ELEMENTS.has(tagLower);

    if (isSVG) {
        const element = document.createElementNS(SVG_NAMESPACE, tag);
        // Set default SVG attributes if it's the root SVG element
        if (tagLower === 'svg') {
            element.setAttribute('version', '1.1');
            element.setAttribute('xmlns', SVG_NAMESPACE);
            element.setAttribute('xmlns:xlink', XLINK_NAMESPACE);
        }
        return { element, isSVG };
    }

    return {
        element: document.createElement(tag),
        isSVG: false
    };
};

const handleEventAndRef = (element: Element, name: string, value: any): boolean => {
    // Handle event listeners
    if (name.startsWith('on') && typeof value === 'function') {
        element.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
        return true;
    }

    // Handle refs
    if (name === 'ref') {
        if (typeof value === 'function') value(element);
        else if (typeof value === 'object' && value !== null) value.current = element;
        return true;
    }

    return false;
}

const handleElementProps = (element: Element, props: Props, isSVG: boolean) => {
    Object.entries(props).forEach(([name, value]) => {
        if (handleEventAndRef(element, name, value)) {
            return;
        }

        // Convert camelCase to kebab-case for SVG attributes
        const attrName = name === 'className' ? 'class' :
            isSVG ? name.replace(/([A-Z])/g, '-$1').toLowerCase() : name;

        // Handle boolean attributes
        if (typeof value === 'boolean') {
            value ? element.setAttribute(attrName, '') : element.removeAttribute(attrName);
            return;
        }

        // Handle xlink attributes
        if (name === 'xlinkHref' || name === 'xlink:href' || (name === 'href' && isSVG)) {
            element.setAttributeNS(XLINK_NAMESPACE, 'xlink:href', String(value));
            return;
        }

        // Regular attribute
        element.setAttribute(attrName, String(value));
    });
};

const handleFragment = async (children: any[]) => {
    const fragment = document.createDocumentFragment();
    for (const child of children.flat()) {
        if (child instanceof Promise) {
            const resolved = await child;
            fragment.appendChild(resolved instanceof Node ? resolved : document.createTextNode(String(resolved)));
        } else {
            fragment.appendChild(
                child instanceof Node ? child : document.createTextNode(String(child))
            );
        }
    }
    return fragment;
};

const appendChild = async (element: Element, child: any) => {
    // Skip falsy values but keep 0
    if (child === false || child === null || child === undefined) return;

    if (child instanceof Promise) {
        const resolved = await child;
        // Skip falsy resolved values but keep 0
        if (resolved === false || resolved === null || resolved === undefined) return;

        element.appendChild(
            resolved instanceof Node ? resolved : document.createTextNode(String(resolved))
        );
    } else if (child instanceof Node) {
        element.appendChild(child);
    } else {
        element.appendChild(document.createTextNode(String(child)));
    }
};

const handleChildren = async (element: Element, children: any[]) => {
    // Wait for all children to resolve in order
    for (const child of children.flat()) {
        if (Array.isArray(child)) {
            // Handle nested arrays in order
            for (const subChild of child) {
                await appendChild(element, subChild);
            }
        } else {
            await appendChild(element, child);
        }
    }
};

const handleTransitions = (element: Element, props: Props | null) => {
    if (props?.transitionEnter || props?.transitionExit) {
        Transition(
            element,
            {
                enter: props.transitionEnter || (() => { }),
                exit: props.transitionExit || (() => { })
            }
        );
    }
}

const handleComponent = (tag: Function, props: Props | null, children: any[]) => {
    const componentProps = props ? { ...props } : {};
    if (children.length > 0) {
        componentProps.children = children.length === 1 ? children[0] : children;
    }
    return tag(componentProps);
}

/*
jsx is a function that takes a tag, props, and children and returns a Node.
@param tag The tag to render.
@param props The props to render.
@param children The children to render.
@returns A Node containing the rendered tag, props, and children.
*/
export const jsx = async (
    tag: JSXElementType,
    props: Props | null,
    ...children: (Node | string | boolean | null | undefined | Array<Node | string | boolean | null | undefined>)[]
) => {
    // Handle Fragments
    if (tag === Fragment) {
        return handleFragment(children);
    }

    // Handle function components
    if (typeof tag === 'function') {
        return handleComponent(tag, props, children);
    }

    const { element, isSVG } = handleSVG(tag);

    if (props) {
        handleElementProps(element, props, isSVG);
    }

    await handleChildren(element, children);
    handleTransitions(element, props);

    return element;
}
