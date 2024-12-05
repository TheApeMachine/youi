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
/*
sanitizeHTML is a function that takes a string and returns a sanitized string.
@param str The string to sanitize.
@returns A sanitized string.
*/
export const sanitizeHTML = (str: string): string => {
    // Create a DOMParser to parse HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(str, 'text/html');
    
    // Define allowed tags and attributes
    const allowedTags = ['p', 'b', 'i', 'em', 'strong', 'a', 'br', 'ul', 'ol', 'li', 'div'];
    const allowedAttributes = ['href', 'target'];
    
    // Recursive function to sanitize nodes
    const sanitizeNode = (node: Node): Node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Check if tag is allowed
            if (!allowedTags.includes(element.tagName.toLowerCase())) {
                return document.createTextNode(element.textContent || '');
            }
            
            // Create new element with only allowed attributes
            const cleanElement = document.createElement(element.tagName);
            Array.from(element.attributes).forEach(attr => {
                if (allowedAttributes.includes(attr.name)) {
                    cleanElement.setAttribute(attr.name, attr.value);
                }
            });
            
            // Recursively sanitize children
            Array.from(element.childNodes).forEach(child => {
                cleanElement.appendChild(sanitizeNode(child));
            });
            
            return cleanElement;
        }
        return node.cloneNode(true);
    };
    
    // Sanitize body content
    const sanitized = Array.from(doc.body.childNodes)
        .map(node => sanitizeNode(node))
        .map(node => {
            if (node instanceof Element) {
                return node.outerHTML;
            }
            return node.textContent || '';
        })
        .join('');
    
    return sanitized;
};

// Add Fragment type
export const Fragment = Symbol('Fragment');

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

const handleElementProps = (element: Element, props: Props, isSVG: boolean) => {
    Object.entries(props).forEach(([name, value]) => {
        if (name === 'className') {
            isSVG ? element.setAttributeNS(null, 'class', String(value))
                : element.setAttribute('class', String(value));
            return;
        }

        if (name.startsWith('on') && typeof value === 'function') {
            element.addEventListener(name.slice(2).toLowerCase(), value as EventListener);
            return;
        }

        if (name === 'ref') {
            if (typeof value === 'function') value(element);
            else if (typeof value === 'object' && value !== null) value.current = element;
            return;
        }

        if (typeof value === 'boolean') {
            value ? element.setAttribute(name, '') : element.removeAttribute(name);
            return;
        }

        isSVG ? element.setAttributeNS(null, name, String(value))
            : element.setAttribute(name, String(value));
    });
}

const handleFragment = (children: any[]) => {
    const fragment = document.createDocumentFragment();
    children.flat().forEach(async child => {
        if (child instanceof Promise) {
            const resolved = await child;
            fragment.appendChild(resolved instanceof Node ? resolved : document.createTextNode(String(resolved)))
        } else {
            fragment.appendChild(
                child instanceof Node ? child : document.createTextNode(String(child))
            );
        }
    });
    return fragment;
}

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

const handleSVG = (tag: string): { element: Element, isSVG: boolean } => {
    // Check if element is SVG
    const isSVG = tag === 'svg' || tag === 'path' || tag === 'circle' || tag === 'line' ||
        tag === 'marker' || tag === 'defs' || tag === 'clippath' || tag === 'g';

    // Create the element with proper namespace
    return {
        element: isSVG
            ? document.createElementNS('http://www.w3.org/2000/svg', tag)
            : document.createElement(tag),
        isSVG
    };
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
