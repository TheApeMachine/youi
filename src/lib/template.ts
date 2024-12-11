// @ts-ignore: JSX factory import is used by the transpiler
import { Transition } from "@/lib/transition";
import { registerEventHandlers } from "@/lib/event/dom";

// Export JSX namespace
export namespace JSX {
    export interface Element extends Node { }
    export interface IntrinsicElements {
        [elemName: string]: any;
    }
}

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
                return document.createTextNode(element.textContent ?? '');
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
            return node.textContent ?? '';
        })
        .join('');

    return sanitized;
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
    // Handle mount handler specially
    if (name === 'onMount' && typeof value === 'function') {
        requestAnimationFrame(() => {
            if (element.isConnected) {
                value(element);
            } else {
                const observer = new MutationObserver((mutations, obs) => {
                    if (element.isConnected) {
                        requestAnimationFrame(() => value(element));
                        obs.disconnect();
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            }
        });
        return true;
    }

    // Handle regular event listeners through the event system
    if (name.startsWith('on') && typeof value === 'function') {
        const props = { [name]: value };
        registerEventHandlers(element, props);
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

        // Handle style objects
        if (name === 'style') {
            if (typeof value === 'string') {
                element.setAttribute('style', value.replace(/"/g, '&quot;'));
            } else if (Array.isArray(value)) {
                // Merge all style objects in the array
                const mergedStyles = value.reduce((acc, styleObj) => {
                    if (typeof styleObj === 'object' && styleObj !== null) {
                        return { ...acc, ...styleObj };
                    }
                    return acc;
                }, {});
                
                const styleString = Object.entries(mergedStyles)
                    .filter(([_, val]) => val !== undefined && val !== null)
                    .map(([key, val]) => {
                        // Convert camelCase to kebab-case
                        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                        // Replace double quotes with &quot;
                        const escapedVal = typeof val === 'string' ? val.replace(/"/g, '&quot;') : val;
                        return `${cssKey}: ${escapedVal}`;
                    })
                    .join('; ');
                element.setAttribute('style', styleString);
            } else if (typeof value === 'object' && value !== null) {
                const styleString = Object.entries(value)
                    .filter(([_, val]) => val !== undefined && val !== null)
                    .map(([key, val]) => {
                        // Convert camelCase to kebab-case
                        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
                        // Replace double quotes with &quot;
                        const escapedVal = typeof val === 'string' ? val.replace(/"/g, '&quot;') : val;
                        return `${cssKey}: ${escapedVal}`;
                    })
                    .join('; ');
                element.setAttribute('style', styleString);
            }
            return;
        }

        // Handle className/class objects
        if ((name === 'className' || name === 'class') && typeof value === 'object' && value !== null) {
            if (Array.isArray(value)) {
                const classString = value.filter(Boolean).join(' ');
                element.setAttribute('class', classString);
            } else {
                const classString = Object.entries(value)
                    .filter(([_, enabled]) => enabled)
                    .map(([className]) => className)
                    .join(' ');
                element.setAttribute('class', classString);
            }
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

const handleComponent = async (tag: Function, props: Props | null, children: any[]) => {
    const componentProps = props ? { ...props } : {};
    if (children.length > 0) {
        // Resolve any async children before passing them to the component
        const resolvedChildren = await Promise.all(
            children.map(async child =>
                child instanceof Promise ? await child : child
            )
        );
        componentProps.children = resolvedChildren.length === 1 ? resolvedChildren[0] : resolvedChildren;
    }
    const result = tag(componentProps);
    return result instanceof Promise ? await result : result;
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
    ...children: any[]
) => {
    // Handle Fragments
    if (tag === Fragment) {
        return handleFragment(children);
    }

    // Handle function components
    if (typeof tag === 'function') {
        return handleComponent(tag, props, children);
    }

    // Handle HTML/SVG elements
    const { element, isSVG } = handleSVG(tag);

    if (props) {
        handleElementProps(element, props, isSVG);
    }

    // Resolve all children before appending
    const resolvedChildren = await Promise.all(
        children.flat().map(async child =>
            child instanceof Promise ? await child : child
        )
    );

    // Handle children
    for (const child of resolvedChildren) {
        if (child !== false && child !== null && child !== undefined) {
            element.appendChild(
                child instanceof Node ? child : document.createTextNode(String(child))
            );
        }
    }

    handleTransitions(element, props);
    return element;
};

