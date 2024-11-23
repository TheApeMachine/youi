interface LifecycleHandler {
    onMount?: () => void;
    onUnmount?: () => void;
}

const lifecycleHandlers: WeakMap<Node, LifecycleHandler[]> = new WeakMap();

/** Attach a mount handler to an element */
export const onMount = (element: HTMLElement | null, handler: () => void) => {
    if (!element) {
        console.warn("onMount: Received null element");
        return;
    }

    const handlers = lifecycleHandlers.get(element) || [];
    handlers.push({ onMount: handler });
    lifecycleHandlers.set(element, handlers);

    // Trigger handler immediately if element is already in the DOM
    if (element.isConnected) {
        handler();
    } else {
        // Listen for a custom "connected" event
        element.addEventListener('connected', handler, { once: true });
    }
};

/** Attach an unmount handler to an element */
export const onUnmount = (element: HTMLElement | null, handler: () => void) => {
    if (!element) {
        console.warn("onUnmount: Received null element");
        return;
    }

    const handlers = lifecycleHandlers.get(element) || [];
    handlers.push({ onUnmount: handler });
    lifecycleHandlers.set(element, handlers);

    // Listen for a custom "disconnected" event
    element.addEventListener('disconnected', handler, { once: true });
};

/** Observe shadow root for added/removed nodes */
const observeShadowRoot = (shadowRoot: ShadowRoot) => {
    if (!shadowRoot) return;

    const observer = new MutationObserver((mutations) => handleMutations(mutations));
    observer.observe(shadowRoot, { childList: true, subtree: true });
};

/** Trigger onMount handlers for a node */
export const triggerMount = (node: Node) => {
    const handlers = lifecycleHandlers.get(node);
    handlers?.forEach(({ onMount }) => {
        if (onMount) {
            onMount();
        }
    });

    // Observe shadow root if the node has one
    if (node instanceof HTMLElement && node.shadowRoot) {
        observeShadowRoot(node.shadowRoot);
    }
};

/** Trigger onUnmount handlers for a node */
const triggerUnmount = (node: Node) => {
    const handlers = lifecycleHandlers.get(node);
    handlers?.forEach(({ onUnmount }) => {
        if (onUnmount) {
            onUnmount();
        }
    });
};

/** Batch process mutations for performance */
const handleMutations = (mutations: MutationRecord[]) => {
    const addedNodes: Node[] = [];
    const removedNodes: Node[] = [];

    // Collect all added and removed nodes
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => addedNodes.push(node));
        mutation.removedNodes.forEach((node) => removedNodes.push(node));
    });

    // Trigger mount/unmount handlers in batch
    addedNodes.forEach((node) => triggerMount(node));
    removedNodes.forEach((node) => triggerUnmount(node));
};

// Global observer for the document
const observer = new MutationObserver(handleMutations);

// At the top of the file
const initObserver = () => {
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }
};

initObserver();
