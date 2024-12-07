import { EventType, EventPayload, EventMessage, EventSubscription, EventConfig } from './types';

export const createEventManager = (config: EventConfig = {}) => {
    const worker = new Worker(
        new URL('./worker.ts', import.meta.url),
        { type: 'module' }
    );

    const messageQueue = new Map<string, {
        resolve: (value: any) => void;
        reject: (error: any) => void;
    }>();

    const subscribers = new Map<string, Set<(payload: EventPayload) => void>>();
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

    const handleMessage = (event: MessageEvent) => {
        const { type, payload, id } = event.data;

        if (type === 'publish' && payload.data) {
            const callbacks = subscribers.get(payload.data.topic);
            callbacks?.forEach(callback => callback(payload.data));
            return;
        }

        if (id && messageQueue.has(id)) {
            const { resolve, reject } = messageQueue.get(id)!;
            if (type === 'error') {
                reject(new Error(payload.error));
            } else {
                resolve(payload);
            }
            messageQueue.delete(id);
        }
    };

    const sendMessage = async (type: string, payload: any): Promise<any> => {
        await ready;

        return new Promise((resolve, reject) => {
            const id = crypto.randomUUID();
            messageQueue.set(id, { resolve, reject });

            const message: EventMessage = { type: type as any, payload, id };
            worker.postMessage(message);

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
        publish: async (type: EventType, topic: string, data: any) => {
            const payload: EventPayload = {
                type,
                topic,
                data,
                meta: {
                    timestamp: Date.now(),
                    source: 'event-manager'
                }
            };
            await sendMessage('publish', payload);
        },

        subscribe: (topic: string, callback: (payload: EventPayload) => void) => {
            const id = crypto.randomUUID();
            const subscription: EventSubscription = {
                id,
                type: 'custom',
                topic,
                callback
            };

            if (!subscribers.has(topic)) {
                subscribers.set(topic, new Set());
            }
            subscribers.get(topic)!.add(callback);

            sendMessage('subscribe', subscription)
                .catch(error => console.error('Subscription error:', error));

            return () => {
                const callbacks = subscribers.get(topic);
                if (callbacks) {
                    callbacks.delete(callback);
                    if (callbacks.size === 0) {
                        subscribers.delete(topic);
                    }
                }
                sendMessage('unsubscribe', { id, topic })
                    .catch(error => console.error('Unsubscribe error:', error));
            };
        },

        subscribePattern: (pattern: string, callback: (payload: EventPayload) => void) => {
            const id = crypto.randomUUID();
            const subscription: EventSubscription = {
                id,
                type: 'custom',
                pattern,
                callback
            };

            sendMessage('subscribe', subscription)
                .catch(error => console.error('Pattern subscription error:', error));

            return () => {
                sendMessage('unsubscribe', { id, pattern })
                    .catch(error => console.error('Pattern unsubscribe error:', error));
            };
        }
    };
};

// Export a singleton instance
export const eventManager = createEventManager(); 