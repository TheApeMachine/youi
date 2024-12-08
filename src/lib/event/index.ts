import { EventPayload } from './types';

const serializeEventData = (data: any): any => {
    if (!data) return data;

    // Handle common non-serializable objects
    if (data instanceof Event) {
        return {
            type: data.type,
            timeStamp: data.timeStamp,
            // Add any other relevant event properties
            target: data.target instanceof HTMLElement ? {
                id: data.target.id,
                className: data.target.className,
                tagName: data.target.tagName,
                value: 'value' in data.target ? (data.target as HTMLInputElement).value : undefined
            } : null
        };
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => serializeEventData(item));
    }

    // Handle objects
    if (typeof data === 'object') {
        const serialized: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            try {
                // Test if the value can be cloned
                structuredClone(value);
                serialized[key] = value;
            } catch {
                // If it can't be cloned, try to serialize it
                serialized[key] = serializeEventData(value);
            }
        }
        return serialized;
    }

    return data;
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

    const handlers = new Map<string, Set<(payload: EventPayload) => void>>();
    const patternHandlers = new Map<string, Set<(payload: EventPayload) => void>>();
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

    const matchesPattern = (pattern: string, topic: string): boolean => {
        if (pattern === '*') return true;
        if (pattern === topic) return true;

        const patternParts = pattern.split('.');
        const topicParts = topic.split('.');

        if (patternParts.length !== topicParts.length && !pattern.includes('*')) {
            return false;
        }

        return patternParts.every((part, i) => {
            if (part === '*') return true;
            if (part === '**') return true;
            return part === topicParts[i];
        });
    };

    const handleMessage = (event: MessageEvent) => {
        const { type, payload, id } = event.data;

        if (type === 'event' && payload.eventName) {
            const callbacks = handlers.get(payload.eventName);
            callbacks?.forEach(callback => {
                try {
                    callback(payload.event);
                } catch (error) {
                    console.error('Error in event callback:', error);
                }
            });

            patternHandlers.forEach((callbacks, pattern) => {
                if (matchesPattern(pattern, payload.eventName)) {
                    callbacks.forEach(callback => {
                        try {
                            callback(payload.event);
                        } catch (error) {
                            console.error('Error in pattern event callback:', error);
                        }
                    });
                }
            });
        }

        if (id && messageQueue.has(id)) {
            const { resolve, reject } = messageQueue.get(id)!;
            messageQueue.delete(id);

            if (type === 'error') {
                reject(new Error(payload.error));
            } else {
                resolve(payload);
            }
        }
    };

    const sendMessage = async (type: string, payload: any): Promise<any> => {
        await ready;

        // Serialize the payload before sending
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
        subscribePattern: async (pattern: string, handler: (payload: EventPayload) => void) => {
            if (!patternHandlers.has(pattern)) {
                patternHandlers.set(pattern, new Set());
            }
            patternHandlers.get(pattern)!.add(handler);

            return () => {
                const callbacks = patternHandlers.get(pattern);
                if (callbacks) {
                    callbacks.delete(handler);
                    if (callbacks.size === 0) {
                        patternHandlers.delete(pattern);
                    }
                }
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
    subscribePattern: (pattern: string, callback: (payload: EventPayload) => void) => {
        return eventManager.subscribePattern(pattern, callback);
    },
    unsubscribe: async (topic: string, callback: (payload: EventPayload) => void) => {
        const cleanup = await eventManager.subscribe(topic, callback);
        cleanup();
    }
};
