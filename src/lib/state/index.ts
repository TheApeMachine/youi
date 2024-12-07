import { StateBackend, StateConfig, backends } from './backends';

interface StateOptions {
    config: Record<string, StateConfig>;
}

export const createStateManager = (options: StateOptions) => {
    const subscribers = new Map<string, Set<(value: any) => void>>();
    const stateConfig = new Map(Object.entries(options.config));

    const getBackend = (key: string): StateBackend => {
        const config = stateConfig.get(key);
        if (!config?.primary) {
            // Default to indexeddb if no primary specified
            return backends.indexeddb;
        }
        return backends[config.primary];
    };

    const syncToBackends = async (key: string, value: any) => {
        const config = stateConfig.get(key);
        if (!config?.sync) return;

        await Promise.all(
            config.sync.map(async (source) => {
                try {
                    await backends[source].set(key, value);
                } catch (error) {
                    console.error(`Failed to sync ${key} to ${source}:`, error);
                }
            })
        );
    };

    const setupRealtimeSync = (key: string) => {
        const config = stateConfig.get(key);
        if (!config?.realtime) return;

        const backend = getBackend(key);
        if (!backend.subscribe) return;

        backend.subscribe(key, async (value) => {
            // Sync to other backends
            await syncToBackends(key, value);

            // Notify subscribers
            const callbacks = subscribers.get(key);
            callbacks?.forEach(callback => callback(value));
        });
    };

    const get = async <T>(key: string): Promise<T | undefined> => {
        const backend = getBackend(key);
        const config = stateConfig.get(key);

        try {
            // Try cache first if enabled
            if (config?.cache) {
                const cached = await backends.indexeddb.get<T>(key);
                if (cached !== undefined) {
                    return cached;
                }
            }

            // Get from primary backend
            const value = await backend.get<T>(key);

            // Update cache if enabled
            if (config?.cache && value !== undefined) {
                await backends.indexeddb.set(key, value);
            }

            return value;
        } catch (error) {
            console.error(`Failed to get ${key}:`, error);
            return undefined;
        }
    };

    const set = async (key: string, value: any): Promise<void> => {
        const backend = getBackend(key);

        try {
            // Set in primary backend
            await backend.set(key, value);

            // Sync to other backends
            await syncToBackends(key, value);

            // Update cache if enabled
            const config = stateConfig.get(key);
            if (config?.cache) {
                await backends.indexeddb.set(key, value);
            }

            // Notify subscribers
            const callbacks = subscribers.get(key);
            callbacks?.forEach(callback => callback(value));
        } catch (error) {
            console.error(`Failed to set ${key}:`, error);
            throw error;
        }
    };

    const update = async (key: string, value: any): Promise<void> => {
        const backend = getBackend(key);

        try {
            // Update in primary backend
            await backend.update(key, value);

            // Sync to other backends
            await syncToBackends(key, value);

            // Update cache if enabled
            const config = stateConfig.get(key);
            if (config?.cache) {
                await backends.indexeddb.update(key, value);
            }

            // Notify subscribers
            const callbacks = subscribers.get(key);
            callbacks?.forEach(callback => callback(value));
        } catch (error) {
            console.error(`Failed to update ${key}:`, error);
            throw error;
        }
    };

    const subscribe = (key: string, callback: (value: any) => void): () => void => {
        if (!subscribers.has(key)) {
            subscribers.set(key, new Set());
            setupRealtimeSync(key);
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

    // Initialize realtime syncs
    for (const [key, config] of stateConfig.entries()) {
        if (config.realtime) {
            setupRealtimeSync(key);
        }
    }

    return {
        get,
        set,
        update,
        subscribe
    };
};

// Create state manager instance and export it
export const stateManager = {
    registry: {} as Record<string, any>,
    getState: async (key: string) => {
        return stateManager.registry[key];
    },
    init: async () => {
        // Add initialization logic if needed
        return Promise.resolve();
    }
};
