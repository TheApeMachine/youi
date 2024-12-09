import { DOMEventName, EventHandler, ComponentEventProps } from './types';
import { eventManager } from './index';

// Map to track event handlers by element and event type
const handlerMap = new WeakMap<Element, Map<string, Set<EventHandler>>>();

// Single event listener per event type that delegates to registered handlers
const delegateHandler = (eventName: string) => (event: Event) => {
    let target = event.target as Element | null;

    while (target) {
        const handlers = handlerMap.get(target)?.get(eventName);
        if (handlers) {
            handlers.forEach(handler => handler(event));
        }
        target = target.parentElement;
    }
};

// Initialize global event listeners once
const initializedEvents = new Set<string>();

const initializeEventType = (eventName: DOMEventName) => {
    if (!initializedEvents.has(eventName)) {
        document.addEventListener(eventName, delegateHandler(eventName));
        initializedEvents.add(eventName);
    }
};

// Register event handlers for an element
export const registerEventHandlers = (element: Element, props: ComponentEventProps) => {
    if (!handlerMap.has(element)) {
        handlerMap.set(element, new Map());
    }
    const elementHandlers = handlerMap.get(element)!;

    for (const [propName, handler] of Object.entries(props)) {
        if (propName.startsWith('on') && typeof handler === 'function') {
            const eventName = propName.slice(2).toLowerCase() as DOMEventName;

            initializeEventType(eventName);

            if (!elementHandlers.has(eventName)) {
                elementHandlers.set(eventName, new Set());
            }
            elementHandlers.get(eventName)!.add(handler);
        }
    }

    // Cleanup function
    return () => {
        handlerMap.delete(element);
    };
};

// Helper to create event props that integrate with the event system
export const createEventProps = (topic: string): ComponentEventProps => ({
    onClick: (event) => {
        eventManager.publish('dom', `${topic}.click`, {
            originalEvent: event
        });
    },
    onInput: (event) => {
        const target = event.target as HTMLInputElement | null;
        if (!target) return;

        eventManager.publish('dom', `${topic}.input`, {
            value: target.value,
            originalEvent: event
        });
    },
    onChange: (event) => {
        const target = event.target as HTMLInputElement | null;
        if (!target) return;

        eventManager.publish('dom', `${topic}.change`, {
            value: target.value,
            checked: target.checked,
            originalEvent: event
        });
    },
    onBlur: (event) => {
        eventManager.publish('dom', `${topic}.blur`, {
            originalEvent: event
        });
    }
});
