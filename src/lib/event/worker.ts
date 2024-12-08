import { EventMessage, HandlerPayload, EventDispatchPayload } from './types';

interface WorkerState {
    handlers: Map<string, Set<string>>;
}

const initialState: WorkerState = {
    handlers: new Map()
};

const handleMessage = async (state: WorkerState, event: MessageEvent<EventMessage>) => {
    const { type, payload, id } = event.data;

    try {
        switch (type) {
            case 'subscribe': {
                const { eventName, handlerId } = payload as HandlerPayload;
                if (!state.handlers.has(eventName)) {
                    state.handlers.set(eventName, new Set());
                }
                state.handlers.get(eventName)?.add(handlerId);
                postResponse('success', { registered: true }, id);
                break;
            }

            case 'unsubscribe': {
                const { eventName, handlerId } = payload as HandlerPayload;
                state.handlers.get(eventName)?.delete(handlerId);
                if (state.handlers.get(eventName)?.size === 0) {
                    state.handlers.delete(eventName);
                }
                postResponse('success', { unregistered: true }, id);
                break;
            }

            case 'publish': {
                const { eventName, event: ev } = payload as EventDispatchPayload;
                const handlers = state.handlers.get(eventName);
                if (handlers?.size) {
                    postResponse('event', { eventName, event: ev });
                }
                postResponse('success', { published: true }, id);
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

const postResponse = (type: string, payload: any, id?: string) => {
    self.postMessage({ type, payload, id });
};

// Initialize worker
self.onmessage = (event) => handleMessage(initialState, event);
postResponse('ready', { success: true }); 