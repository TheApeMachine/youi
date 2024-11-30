import localforage from 'localforage';

export interface StateModel {
    eventHandlers: Record<string, (event: any) => void>;
}

const StateManager = () => {
    const state: Record<string, any> = {
        ready: false
    };

    const registry: Record<string, any> = {};

    const getState = (key: string) => {
        console.debug("lib.StateManager.get", "key", key);
        const stateValue = state[key];
        const registryValue = stateValue ? undefined : registry[key];

        if (!stateValue && !registryValue) {
            console.error("lib.StateManager.get", "No state value found for key", key);
        }

        return stateValue ?? registryValue;
    };

    const setState = (stateFragment: Record<string, any>) => {
        console.debug("lib.StateManager.set", "stateFragment", stateFragment);
        Object.assign(state, stateFragment);
        persist();
    };

    const register = (key: string, value: any) => {
        console.debug("lib.StateManager.register", "key", key, "value", value);
        registry[key] = value;
    };

    const persist = () => {
        console.debug("lib.StateManager.persist", "state", state);
        localforage.setItem('state', state);
    };

    const init = async (): Promise<void> => {
        console.debug("lib.StateManager.init");
        try {
            const value = await localforage.getItem('state');
            if (value) {
                Object.assign(state, value);
            }
            setState({ ready: true });
        } catch (error) {
            console.error("Error initializing StateManager:", error);
            setState({ ready: false });
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