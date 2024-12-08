import { eventManager } from '@/lib/event';

export const createStateManager = () => {
    const subscribers = new Map<string, Set<(value: any) => void>>();
    let worker: Worker | null = null;
    let messageId = 0;
    const messageQueue = new Map<string, { resolve: Function, reject: Function }>();

    // Add worker initialization
    const initWorker = async () => {
        worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });

        worker.onmessage = (event) => {
            const { type, payload, id } = event.data;

            if (type === 'ready') {
                return;
            }

            // Handle queued promises
            if (id && messageQueue.has(id)) {
                const { resolve, reject } = messageQueue.get(id)!;
                messageQueue.delete(id);

                if (type === 'error') {
                    reject(new Error(payload.error));
                } else {
                    resolve(payload);
                }
                return;
            }

            // Handle notifications
            if (type === 'notify') {
                const callbacks = subscribers.get(payload.key);
                callbacks?.forEach(callback => callback(payload.value));
            }
        };

        // Wait for worker to be ready
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Worker initialization timeout')), 5000);

            worker!.addEventListener('message', function onReady(event) {
                if (event.data.type === 'ready') {
                    clearTimeout(timeout);
                    worker!.removeEventListener('message', onReady);
                    resolve();
                }
            });
        });
    };

    // Add worker message helper
    const sendWorkerMessage = async (type: string, payload: any): Promise<any> => {
        if (!worker) throw new Error('Worker not initialized');

        return new Promise((resolve, reject) => {
            const id = String(messageId++);
            messageQueue.set(id, { resolve, reject });
            worker!.postMessage({ type, payload, id });
        });
    };

    // Modify get to use worker
    const get = async <T>(key: string): Promise<T | undefined> => {
        try {
            const response = await sendWorkerMessage('read', key);
            return response.value as T;
        } catch (error) {
            console.error(`Failed to get ${key}:`, error);
            return undefined;
        }
    };

    // Modify set to use worker
    const set = async (key: string, value: any): Promise<void> => {
        try {
            await sendWorkerMessage('write', { key, value });
        } catch (error) {
            console.error(`Failed to set ${key}:`, error);
            throw error;
        }
    };

    // Modify update to use worker
    const update = async (key: string, value: any): Promise<void> => {
        try {
            await sendWorkerMessage('update', { key, value });
            // Publish state change event
            eventManager.publish('state', 'change', {
                type: 'stateChange',
                data: {
                    key,
                    value,
                    metadata: {
                        timestamp: Date.now(),
                        version: 1
                    }
                }
            });
        } catch (error) {
            console.error(`Failed to update ${key}:`, error);
            throw error;
        }
    };

    // Modify subscribe to use worker
    const subscribe = (key: string, callback: (value: any) => void): () => void => {
        if (!subscribers.has(key)) {
            subscribers.set(key, new Set());
            // Register subscriber with worker
            sendWorkerMessage('notify', {
                key,
                subscriber: crypto.randomUUID()
            }).catch(console.error);
        }

        const callbacks = subscribers.get(key)!;
        callbacks.add(callback);

        return () => {
            callbacks.delete(callback);
            if (callbacks.size === 0) {
                subscribers.delete(key);
            }
        };
    };

    return {
        get,
        set,
        update,
        subscribe,
        init: async () => {
            await initWorker();
        }
    };
};

// Export the state manager instance
const stateManagerInstance = createStateManager();
export { stateManagerInstance as stateManager };
