import { EventMessage, HandlerPayload, EventDispatchPayload } from './types';

interface WorkerState {
    handlers: Map<string, Set<string>>; // exact eventName -> handlerId
    patternHandlers: Map<string, Set<string>>; // pattern -> handlerId
}

const initialState: WorkerState = {
    handlers: new Map(),
    patternHandlers: new Map()
};

self.onmessage = (event) => handleMessage(initialState, event);

const handleSubscribe = (state: WorkerState, payload: HandlerPayload, id: string) => {
    const { eventName, handlerId } = payload;
    if (isPattern(eventName)) {
        addSubscription(state.patternHandlers, eventName, handlerId);
    } else {
        addSubscription(state.handlers, eventName, handlerId);
    }
    postResponse('success', { registered: true }, id);
}

const handleUnsubscribe = (state: WorkerState, payload: HandlerPayload, id: string) => {
    const { eventName, handlerId } = payload;
    if (isPattern(eventName)) {
        removeSubscription(state.patternHandlers, eventName, handlerId);
    } else {
        removeSubscription(state.handlers, eventName, handlerId);
    }
    postResponse('success', { unregistered: true }, id);
}

const handlePublish = (state: WorkerState, payload: EventDispatchPayload, id: string) => {
    const { eventName, event: ev } = payload;

    // Dispatch to exact matches
    const exactHandlers = state.handlers.get(eventName);
    if (exactHandlers && exactHandlers.size > 0) {
        postResponse('event', { eventName, event: ev }, id);
    }

    // Dispatch to pattern matches
    for (const [pattern, patternSet] of state.patternHandlers.entries()) {
        if (patternSet.size > 0 && matchesPattern(pattern, eventName)) {
            postResponse('event', { eventName: pattern, event: ev }, id);
        }
    }

    postResponse('success', { published: true }, id);
}

const handleMessage = async (state: WorkerState, event: MessageEvent<EventMessage>) => {
    const { type, payload, id } = event.data;

    try {
        switch (type) {
            case 'subscribe': {
                if (!id) throw new Error('No ID provided');
                handleSubscribe(state, payload as HandlerPayload, id);
                break;
            }

            case 'unsubscribe': {
                if (!id) throw new Error('No ID provided');
                handleUnsubscribe(state, payload as HandlerPayload, id);
                break;
            }

            case 'publish': {
                if (!id) throw new Error('No ID provided');
                handlePublish(state, payload as EventDispatchPayload, id);
                break;
            }

            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        postResponse('error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        }, id);
    }
};

const addSubscription = (map: Map<string, Set<string>>, key: string, handlerId: string) => {
    if (!map.has(key)) {
        map.set(key, new Set());
    }
    map.get(key)!.add(handlerId);
};

const removeSubscription = (map: Map<string, Set<string>>, key: string, handlerId: string) => {
    const set = map.get(key);
    if (set) {
        set.delete(handlerId);
        if (set.size === 0) {
            map.delete(key);
        }
    }
};

const isPattern = (eventName: string): boolean => {
    return eventName.includes('*');
};

const matchesPattern = (pattern: string, topic: string): boolean => {
    if (pattern === '*') return true;
    if (pattern === topic) return true;

    const patternParts = pattern.split('.');
    const topicParts = topic.split('.');

    // If pattern includes '**', it's a multi-level wildcard
    // Otherwise we match part by part
    return patternParts.every((part, i) => {
        if (part === '**') {
            // '**' can match one or more segments, so we consider the rest matched
            // if we've reached '**' and it's the last part of the pattern.
            // If pattern ends with '**', it's basically a prefix match beyond this point.
            return i === patternParts.length - 1;
        }
        if (part === '*') return topicParts[i] !== undefined;
        return part === topicParts[i];
    });
};

const postResponse = (type: string, payload: any, id?: string) => {
    self.postMessage({ type, payload, id });
};

postResponse('ready', { success: true });