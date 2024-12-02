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

    const executeCallback = (callback: Function, payload: unknown) => {
        try {
            callback(payload);
        } catch (err) {
            console.error(`Error in event listener:`, err);
        }
    };

    const subscribe = (event: string, callback: Function, condition: (payload: any) => boolean = () => true) => {
        if (!listeners[event]) {
            listeners[event] = new Set();
        }
        const wrappedCallback = (payload: unknown) => {
            if (condition(payload)) {
                callback(payload);
            }
        };
        listeners[event].add(wrappedCallback);
    };

    const publish = (event: string, payload: any) => {
        if (!listeners[event] || listeners[event].size === 0) {
            console.warn(`No listeners for event: ${event}`);
            return;
        }
        listeners[event].forEach(callback => executeCallback(callback, payload));
    };

    // Initialize state change subscription
    subscribe("stateChange", (data: { key: string; value: any }) => {
        console.log("stateChange", data);
        stateManager.setState(data);
    });

    return { subscribe, publish };
};

export const eventBus = EventBus();

// EventManager for handling DOM events and event delegation
export const EventManager = () => {
    type EventHandler = (event: Event) => void;
    type WheelHandler = (event: WheelEvent) => void;
    type DragHandler = (event: DragEvent) => void;

    const createEventPayload = (target: HTMLElement, event: Event) => ({
        effect: target.dataset.effect,
        topic: target.dataset.topic,
        originalEvent: event,
        meta: {
            timeStamp: Date.now(),
            target: target.tagName,
            initiator: "EventManager"
        }
    });

    const handleEvent = (event: Event) => {
        const target = event.target as HTMLElement;
        if (target?.dataset?.event) {
            eventBus.publish(target.dataset.event, createEventPayload(target, event));
        }
    };

    const handleNavigationClick = (link: HTMLAnchorElement, event: Event) => {
        event.preventDefault();
        eventBus.publish('navigate', {
            url: link.getAttribute('href'),
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

    const handlers: Record<string, EventHandler | WheelHandler | DragHandler> = {
        click: handleClick,
        wheel: handleEvent,
        drag: handleEvent,
        submit: handleEvent
    };

    const init = () => {
        (["click", "wheel", "drag"] as const).forEach(eventType => {
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

    const handleMutationNode = (node: Node, element: HTMLElement, callback: Function) => {
        if (node === element) callback();
    };

    const handleMutation = (mutation: MutationRecord, element: HTMLElement, mountCallback: Function, unmountCallback: Function) => {
        mutation.addedNodes.forEach(node => handleMutationNode(node, element, mountCallback));
        mutation.removedNodes.forEach(node => handleMutationNode(node, element, unmountCallback));
    };

    const manageComponentLifecycle = (element: HTMLElement, mountCallback: Function, unmountCallback: Function) => {
        const observer = new MutationObserver(mutations =>
            mutations.forEach(mutation => handleMutation(mutation, element, mountCallback, unmountCallback))
        );
        observer.observe(document.body, { childList: true, subtree: true });
    };

    return { init, addEvent, removeEvent, addScopedEventListener, manageComponentLifecycle };
};

