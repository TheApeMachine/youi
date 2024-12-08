import { ComponentProps } from "@/lib/component";
import { EventPayload, EventMessage, EventSubscription, EventConfig } from './types';

// Define state type
interface WorkerState extends ComponentProps {
    subscriptions: Map<string, Set<string>>;
    eventBuffer: EventPayload[];
    retainedEvents: Map<string, EventPayload>;
    config: EventConfig;
}

interface WorkerMethods {
    matchPattern: (topic: string, pattern: string) => boolean;
    handleSubscribe: (state: WorkerState, subscription: { id: string; topic?: string; pattern?: string }, id?: string) => Promise<void>;
    handleUnsubscribe: (state: WorkerState, subscription: { id: string; topic?: string; pattern?: string }, id?: string) => Promise<void>;
    handlePublish: (state: WorkerState, payload: EventPayload, id?: string) => Promise<void>;
}

const workerMethods: WorkerMethods = {
    matchPattern: (topic: string, pattern: string): boolean => {
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexPattern}$`).test(topic);
    },

    handleSubscribe: async (state: WorkerState, subscription: { id: string; topic?: string; pattern?: string }, id?: string) => {
        const topic = subscription.topic ?? '';
        if (!state.subscriptions.has(topic)) {
            state.subscriptions.set(topic, new Set());
        }
        state.subscriptions.get(topic)?.add(subscription.id);
        postResponse('subscribe', { success: true }, id);
    },

    handleUnsubscribe: async (state: WorkerState, subscription: { id: string; topic?: string; pattern?: string }, id?: string) => {
        const topic = subscription.topic ?? '';
        if (state.subscriptions.has(topic)) {
            state.subscriptions.get(topic)?.delete(subscription.id);
            if (state.subscriptions.get(topic)?.size === 0) {
                state.subscriptions.delete(topic);
            }
        }
        postResponse('unsubscribe', { success: true }, id);
    },

    handlePublish: async (state: WorkerState, payload: EventPayload, id?: string) => {
        const topic = payload.topic ?? '';
        const subscribers = state.subscriptions.get(topic) || new Set();

        // Send event to all subscribers
        if (subscribers.size > 0) {
            postResponse('publish', { data: payload });
        }

        postResponse('publish', { success: true }, id);
    }
};

const handleMessage = async (props: WorkerState, event: MessageEvent<EventMessage>) => {
    const { type, payload, id } = event.data;

    try {
        switch (type) {
            case 'subscribe':
                await workerMethods.handleSubscribe(props, payload as EventSubscription, id);
                break;
            case 'unsubscribe':
                await workerMethods.handleUnsubscribe(props, payload as EventSubscription, id);
                break;
            case 'publish':
                await workerMethods.handlePublish(props, payload as EventPayload, id);
                break;
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        postResponse('error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        }, id);
    }
};

const postResponse = (type: string, payload: any, id?: string) => {
    self.postMessage({ type, payload, id });
};

// Initialize with state
const initialState: WorkerState = {
    subscriptions: new Map(),
    eventBuffer: [],
    retainedEvents: new Map(),
    config: {}
};

// Handle messages
self.onmessage = (event) => handleMessage(initialState, event);

// Send ready message
postResponse('ready', { success: true }); 