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

    const subscribe = (event: string, callback: Function, condition: (payload: any) => boolean = () => true) => {
        if (!listeners[event]) {
            listeners[event] = new Set();
        }
        // Add the condition wrapper around the callback
        listeners[event].add((payload: unknown) => {
            if (condition(payload)) {
                callback(payload);
            }
        });
    };

    const publish = (event: string, payload: any) => {
        if (!listeners[event] || listeners[event].size === 0) {
            console.warn(`No listeners for event: ${event}`);
            return;
        }

        listeners[event].forEach(callback => {
            try {
                callback(payload);
            } catch (err) {
                console.error(`Error in event listener for event: ${event}`, err);
            }
        });
    };

    // Subscribe to state change events and update the stateManager accordingly
    subscribe("stateChange", (data: { key: string; value: any }) => {
        const { key, value } = data;
        stateManager.setState({ [key]: value });
    });

    return { subscribe, publish };
};

export const eventBus = EventBus();

// EventManager for handling DOM events and event delegation
export const EventManager = () => {
    // Define proper types for our event handlers
    type EventHandler = (event: Event) => void;
    type WheelHandler = (event: WheelEvent) => void;
    type DragHandler = (event: DragEvent) => void;

    const handleWheel: WheelHandler = (event) => {
        handleEvent(event);
    };

    const handleDrag: DragHandler = (event) => {
        handleEvent(event);
    };

    // Event handlers mapping
    const handlers: Record<string, EventHandler | WheelHandler | DragHandler> = {
        click: (event: Event) => handleClick(event),
        wheel: handleWheel,
        drag: handleDrag
    };

    const init = () => {
        // Initialize event listeners for click, wheel, and drag events globally
        (["click", "wheel", "drag"] as const).forEach(eventType => {
            document.addEventListener(eventType, handlers[eventType] as EventListener);
        });
    };

    // Handle click events with delegation logic to find the correct element with 'data-event' attribute
    const handleClick = (event: Event) => {
        if (!(event.target instanceof HTMLElement)) return;

        const link = event.target.closest('a');
        if (link?.href?.startsWith(window.location.origin)) {
            event.preventDefault();
            eventBus.publish('navigate', {
                url: link.getAttribute('href'),
                originalEvent: event
            });
            return;
        }

        let element = event.target;
        while (element && !element.hasAttribute("data-event")) {
            element = element.parentElement as HTMLElement;
        }

        if (element) {
            handleEvent(event);
        }
    };

    // Generic handleEvent function to publish event data through EventBus
    const handleEvent = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target?.dataset?.event) {
            // Enhanced payload to include more metadata for debugging and analytics
            eventBus.publish(target.dataset.event, {
                effect: target.dataset.effect,
                topic: target.dataset.topic,
                originalEvent: event,
                meta: {
                    timeStamp: Date.now(),
                    target: target.tagName,
                    initiator: "EventManager"
                }
            });
        }
    };

    // Add an event listener dynamically
    const addEvent = (eventType: string, handler: EventHandler) => {
        handlers[eventType] = handler;
        document.addEventListener(eventType, handler);
    };

    // Remove an event listener dynamically
    const removeEvent = (eventType: string) => {
        const handler = handlers[eventType];
        if (handler) {
            document.removeEventListener(eventType, handler as EventListener);
            delete handlers[eventType];
        }
    };

    // Scoped Event Listener - Add listener to a specific element (not the whole document)
    const addScopedEventListener = (scope: HTMLElement, eventType: string, handler: EventHandler) => {
        scope.addEventListener(eventType, handler);
    };

    // Component-level lifecycle management for adding/removing event listeners
    const manageComponentLifecycle = (element: HTMLElement, mountCallback: Function, unmountCallback: Function) => {
        // Observer to detect addition/removal
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node === element) {
                        mountCallback();
                    }
                });
                mutation.removedNodes.forEach((node) => {
                    if (node === element) {
                        unmountCallback();
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    return { init, addEvent, removeEvent, addScopedEventListener, manageComponentLifecycle };
};

