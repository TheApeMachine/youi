import { stateManager } from "@/lib/state";

export interface EventPayload {
    topic?: string;
    effect?: string;
    event?: string;
    trigger?: string;
    originalEvent?: Event;
    meta?: {
        timeStamp: number;
        target: string;
        initiator: string;
    };
}

// EventBus for handling publish/subscribe system
const EventBus = () => {
    const listeners: Record<string, Set<Function>> = {};
    const wrappedCallbacks = new WeakMap<Function, Function>();
    const eventQueue: Array<{ event: string; payload: any; timestamp: number }> = [];
    const MAX_QUEUE_SIZE = 100;
    const MAX_EVENT_AGE_MS = 5000; // 5 seconds

    const executeCallback = (callback: Function, payload: unknown) => {
        try {
            callback(payload);
        } catch (err) {
            console.error(`Error in event listener:`, err);
        }
    };

    const cleanQueue = () => {
        const now = Date.now();
        const cutoffTime = now - MAX_EVENT_AGE_MS;
        while (eventQueue.length > 0 && eventQueue[0].timestamp < cutoffTime) {
            eventQueue.shift();
        }
    };

    const subscribe = (event: string, callback: Function, condition: (payload: any) => boolean = () => true) => {
        console.log("Subscribing to event:", event);
        if (!listeners[event]) {
            listeners[event] = new Set();
            const relevantEvents = eventQueue.filter(e => e.event === event);
            relevantEvents.forEach(({ payload }) => {
                if (condition(payload)) {
                    callback(payload);
                }
            });
        }
        const wrappedCallback = (payload: unknown) => {
            if (condition(payload)) {
                callback(payload);
            }
        };
        wrappedCallbacks.set(callback, wrappedCallback);
        listeners[event].add(wrappedCallback);
    };

    const unsubscribe = (event: string, callback: Function) => {
        if (listeners[event]) {
            const wrappedCallback = wrappedCallbacks.get(callback);
            if (wrappedCallback) {
                listeners[event].delete(wrappedCallback);
                wrappedCallbacks.delete(callback);
            }
            if (listeners[event].size === 0) {
                delete listeners[event];
            }
        }
    };

    const publish = (event: string, payload: any) => {
        cleanQueue();

        eventQueue.push({
            event,
            payload,
            timestamp: Date.now()
        });

        if (eventQueue.length > MAX_QUEUE_SIZE) {
            eventQueue.shift();
        }

        if (listeners[event]?.size > 0) {
            listeners[event].forEach(callback => executeCallback(callback, payload));
        } else {
            console.warn(`No listeners for event: ${event}`);
        }
    };

    // Initialize state change subscription
    subscribe("stateChange", (data: { key: string; value: any }) => {
        stateManager.setState(data);
    });

    return { subscribe, publish, unsubscribe };
};

export const eventBus = EventBus();

// EventManager for handling DOM events and event delegation
export const EventManager = () => {
    type EventHandler = (event: Event) => void;
    type WheelHandler = (event: WheelEvent) => void;
    type DragHandler = (event: DragEvent) => void;
    type MouseMoveHandler = (event: MouseEvent) => void;

    const createEventPayload = (target: HTMLElement, event: Event) => ({
        ...target.dataset,
        originalEvent: event,
        meta: {
            timeStamp: Date.now(),
            target: target.tagName,
            initiator: "EventManager"
        }
    });

    const handleEvent = (event: Event) => {
        const target = event.target as HTMLElement | null;

        // Special case for mousemove - always publish
        if (event.type === 'mousemove') {
            eventBus.publish('mousemove', {
                originalEvent: event,
                meta: {
                    timeStamp: Date.now(),
                    target: target?.tagName ?? 'unknown',
                    initiator: "EventManager"
                }
            });
            return;
        }

        // Original behavior for other events
        if (target?.dataset?.event) {
            console.log("Publishing event:", target.dataset.event);
            eventBus.publish(target.dataset.event, createEventPayload(target, event));
        }
    };

    const handleNavigationClick = (link: HTMLAnchorElement, event: Event) => {
        event.preventDefault();
        const url = new URL(link.href).pathname;
        eventBus.publish('navigate', {
            url,
            originalEvent: event
        });
    };

    const findEventElement = (target: HTMLElement): HTMLElement | null => {
        let element: HTMLElement | null = target;
        while (element && !element.hasAttribute("data-event")) {
            element = element.parentElement;
        }
        return element;
    };

    const handleClick = (event: Event) => {
        if (!(event.target instanceof HTMLElement)) return;

        const link = event.target.closest('a');
        if (link?.href?.startsWith(window.location.origin)) {
            handleNavigationClick(link, event);
            return;
        }

        const eventElement = findEventElement(event.target);
        if (eventElement) {
            handleEvent(event);
        }
    };

    // Now declare handlers after all the functions are defined
    const handlers: Record<string, EventHandler | WheelHandler | DragHandler | MouseMoveHandler> = {
        click: handleClick,
        wheel: handleEvent,
        drag: handleEvent,
        submit: handleEvent,
        mousemove: handleEvent
    };

    const init = () => {
        (["click", "wheel", "drag", "mousemove"] as const).forEach(eventType => {
            document.addEventListener(eventType, handlers[eventType] as EventListener);
        });
    };

    const addEvent = (eventType: string, handler: EventHandler) => {
        handlers[eventType] = handler;
        document.addEventListener(eventType, handler);
    };

    const removeEvent = (eventType: string) => {
        const handler = handlers[eventType];
        if (handler) {
            document.removeEventListener(eventType, handler as EventListener);
            delete handlers[eventType];
        }
    };

    const addScopedEventListener = (scope: HTMLElement, eventType: string, handler: EventHandler) => {
        scope.addEventListener(eventType, handler);
    };

    const handleNodeAddition = (node: Node, element: HTMLElement, mountCallback: Function) => {
        if (!node || !element) return;

        if (node instanceof Element && (node === element || node.contains(element))) {
            mountCallback();
        }
    };

    const handleNodeRemoval = (node: Node, element: HTMLElement, unmountCallback: Function, scopedListeners: Record<string, EventHandler>) => {
        if (!node || !element) return;

        // Check if the removed node is or contains our element
        const isRemoved = node === element ||
            (node instanceof Element && node.contains(element)) ||
            (element instanceof Element && element.contains(node));

        if (isRemoved) {
            unmountCallback();
            Object.keys(scopedListeners).forEach(eventType => {
                element.removeEventListener(eventType, scopedListeners[eventType]);
            });
        }
    };

    const processMutation = (
        mutation: MutationRecord,
        element: HTMLElement,
        mountCallback: Function,
        unmountCallback: Function,
        scopedListeners: Record<string, EventHandler>
    ) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => handleNodeAddition(node, element, mountCallback));
            mutation.removedNodes.forEach(node => handleNodeRemoval(node, element, unmountCallback, scopedListeners));
        }
    };

    const createObserver = (
        element: HTMLElement,
        mountCallback: Function,
        unmountCallback: Function,
        scopedListeners: Record<string, EventHandler>
    ) => {
        const observer = new MutationObserver(mutations =>
            mutations.forEach(mutation =>
                processMutation(mutation, element, mountCallback, unmountCallback, scopedListeners)
            )
        );

        // Check if element is already in the DOM
        if (document.body.contains(element)) {
            mountCallback();
        }

        return observer;
    };

    const manageComponentLifecycle = (
        element: HTMLElement,
        mountCallback: Function,
        unmountCallback: Function,
        scopedListeners: Record<string, EventHandler> = {}
    ) => {
        const observer = createObserver(element, mountCallback, unmountCallback, scopedListeners);

        // Observe the entire document for better removal detection
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        // Initial mount check
        if (document.documentElement.contains(element)) {
            mountCallback();
        }

        return observer;
    };

    return {
        init,
        addEvent,
        removeEvent,
        addScopedEventListener,
        manageComponentLifecycle,
        handlers // Expose handlers for testing
    };
};

export type EventManagerType = ReturnType<typeof EventManager> & {
    handlers: Record<string, (event: Event) => void>;
};

