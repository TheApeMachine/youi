import { EventPayload, EventMessage } from './types';

const handleEvent = (data: any): any => {
    return {
        type: data.type,
        timeStamp: data.timeStamp,
        target: data.target instanceof HTMLElement ? {
            id: data.target.id,
            className: data.target.className,
            tagName: data.target.tagName,
            value: 'value' in data.target ? (data.target as HTMLInputElement).value : undefined
        } : null
    };
}

const handleObject = (data: any): any => {
    const serialized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        try {
            serialized[key] = structuredClone(value);
        } catch {
            serialized[key] = serializeEventData(value);
        }
    }
    return serialized;
}

const serializeEventData = (data: any): any => {
    // Try using structuredClone directly if available
    try {
        return structuredClone(data);
    } catch {
        // Fallback recursive serialization if structuredClone fails
        if (data instanceof Event) {
            return handleEvent(data);
        }

        if (Array.isArray(data)) {
            return data.map(item => serializeEventData(item));
        }

        if (typeof data === 'object' && data !== null) {
            return handleObject(data);
        }

        return data;
    }
};

export const createEventManager = () => {
    const worker = new Worker(
        new URL('./worker.ts', import.meta.url),
        { type: 'module' }
    );

    const messageQueue = new Map<string, {
        resolve: (value: any) => void;
        reject: (error: any) => void;
    }>();

    // Now the main thread just stores callbacks keyed by eventName (exact or pattern)
    // We rely on the worker to do all pattern matches and return the eventName accordingly.
    const handlers = new Map<string, Set<(payload: EventPayload) => void>>();

    const ready = initialize();

    async function initialize(): Promise<void> {
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('Event worker initialization timeout'));
            }, 5000);

            const onReady = (event: MessageEvent) => {
                if (event.data.type === 'ready') {
                    clearTimeout(timeoutId);
                    worker.removeEventListener('message', onReady);
                    if (event.data.payload.success) {
                        resolve();
                    } else {
                        reject(new Error(event.data.payload.error));
                    }
                }
            };

            worker.addEventListener('message', onReady);
        });
    }

    const handleMessage = (event: MessageEvent<EventMessage>) => {
        const { type, payload, id } = event.data;

        if (type === 'event' && 'eventName' in payload && 'event' in payload) {
            const callbacks = handlers.get(payload.eventName);
            if (callbacks && callbacks.size > 0) {
                callbacks.forEach(callback => {
                    try {
                        callback(payload.event);
                    } catch (error) {
                        console.error('Error in event callback:', error);
                    }
                });
            }
        }

        if (id && messageQueue.has(id)) {
            const { resolve, reject } = messageQueue.get(id)!;
            messageQueue.delete(id);

            if (type === 'error' && 'error' in payload) {
                reject(new Error(payload.error));
            } else {
                resolve(payload);
            }
        }
    };

    const sendMessage = async (type: string, payload: any): Promise<any> => {
        await ready;

        const serializedPayload = serializeEventData(payload);

        return new Promise((resolve, reject) => {
            const id = crypto.randomUUID();
            messageQueue.set(id, { resolve, reject });

            try {
                worker.postMessage({ type, payload: serializedPayload, id });
            } catch (error) {
                messageQueue.delete(id);
                reject(error instanceof Error ? error : new Error(String(error)));
                return;
            }

            // Set a timeout for the response
            setTimeout(() => {
                if (messageQueue.has(id)) {
                    messageQueue.delete(id);
                    reject(new Error(`Message timeout: ${type}`));
                }
            }, 5000);
        });
    };

    worker.onmessage = handleMessage;

    return {
        init: async () => {
            await ready;
        },
        subscribe: async (topic: string, handler: (payload: EventPayload) => void) => {
            const handlerId = crypto.randomUUID();

            if (!handlers.has(topic)) {
                handlers.set(topic, new Set());
            }
            handlers.get(topic)!.add(handler);

            await sendMessage('subscribe', { eventName: topic, handlerId });

            return () => {
                const callbacks = handlers.get(topic);
                if (callbacks) {
                    callbacks.delete(handler);
                    if (callbacks.size === 0) {
                        handlers.delete(topic);
                    }
                }
                sendMessage('unsubscribe', { eventName: topic, handlerId })
                    .catch(error => console.error('Unsubscribe error:', error));
            };
        },
        publish: async (type: string, topic: string, data: any) => {
            await sendMessage('publish', { eventName: topic, event: { type, data } });
        }
    };
};

// Export a singleton instance
export const eventManager = {
    ...createEventManager(),
    init: async () => {
        return Promise.resolve();
    }
};

// Export the event bus instance with proper types
export const eventBus = {
    ...eventManager,
    subscribe: (topic: string, callback: (payload: EventPayload) => void) => {
        return eventManager.subscribe(topic, callback);
    },
    unsubscribe: async (topic: string, callback: (payload: EventPayload) => void) => {
        const cleanup = await eventManager.subscribe(topic, callback);
        cleanup();
    }
};
