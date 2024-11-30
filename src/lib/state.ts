import localforage from 'localforage';

export interface StateModel {
    eventHandlers: Record<string, (event: any) => void>;
}

const StateManager = () => {
    const state: Record<string, any> = {
        ready: false,
        initialized: false
    };

    const registry: Record<string, any> = {};

    const getState = (key: string) => {
        console.debug("lib.StateManager.get", "key", key);
        const stateValue = state[key];
        const registryValue = stateValue === undefined ? registry[key] : undefined;

        return stateValue ?? registryValue;
    };

    const setState = (stateFragment: Record<string, any>) => {
        console.debug("lib.StateManager.set", "stateFragment", stateFragment);

        // If it's a key-value pair format
        if ('key' in stateFragment && 'value' in stateFragment) {
            state[stateFragment.key] = stateFragment.value;
        } else {
            // Direct state fragment
            Object.assign(state, stateFragment);
        }

        persist();
    };

    const register = (key: string, value: any) => {
        console.debug("lib.StateManager.register", "key", key, "value", value);
        registry[key] = value;
    };

    const persist = async () => {
        console.debug("lib.StateManager.persist", "state", state);
        try {
            await localforage.setItem('state', state);
        } catch (error) {
            console.error("Error persisting state:", error);
        }
    };

    const init = async (): Promise<void> => {
        console.debug("lib.StateManager.init");
        try {
            const value = await localforage.getItem('state');
            console.log("Loaded state from storage:", value);
            if (value) {
                Object.assign(state, value);
            }
            setState({ ready: true, initialized: true });
        } catch (error) {
            console.error("Error initializing StateManager:", error);
            setState({ ready: false, initialized: true });
            throw error;
        }
    };

    return {
        getState,
        setState,
        register,
        init,
        registry
    };
}

export const stateManager = StateManager();