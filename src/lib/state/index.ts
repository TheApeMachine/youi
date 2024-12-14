import { eventManager } from '@/lib/event';
import { initWorkerCommunication, sendWorkerMessage } from './worker-instance';

interface WorkerResponse {
    value: unknown;
}

export const createStateManager = () => {
    const subscribers = new Map<string, Set<(value: any) => void>>();
    let cleanup: (() => void) | null = null;

    const get = async <T>(key: string): Promise<T | undefined> => {
        try {
            const response = await sendWorkerMessage('read', key) as WorkerResponse;
            return response.value as T;
        } catch (error) {
            console.error(`Failed to get ${key}:`, error);
            return undefined;
        }
    };

    const set = async (key: string, value: any): Promise<void> => {
        try {
            await sendWorkerMessage('write', { key, value });
        } catch (error) {
            console.error(`Failed to set ${key}:`, error);
            throw error;
        }
    };

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
            eventManager.publish('render', 'update', { type: 'render' });
        } catch (error) {
            console.error(`Failed to update ${key}:`, error);
            throw error;
        }
    };

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

    const remove = async (key: string): Promise<void> => {
        try {
            await sendWorkerMessage('remove', { key });
            // Publish state removal event
            eventManager.publish('state', 'remove', {
                type: 'stateRemove',
                data: { key }
            });
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            throw error;
        }
    };

    return {
        get,
        set,
        update,
        subscribe,
        remove,
        init: async () => {
            cleanup = initWorkerCommunication();
            // Wait for worker to be ready
            await sendWorkerMessage('ready');
        },
        destroy: () => {
            cleanup?.();
        }
    };
};

// Export the state manager instance
const stateManagerInstance = createStateManager();
export { stateManagerInstance as stateManager };