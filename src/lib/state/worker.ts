import localforage from 'localforage';

interface StateMessage {
    type: 'read' | 'write' | 'update' | 'notify' | 'remove';
    payload: any;
    id?: string;
}

interface StateData {
    value: any;
    timestamp: number;
    version: number;
}

const createStateWorker = () => {
    const state = new Map<string, StateData>();
    const subscribers = new Map<string, string[]>();
    let version = 0;

    const updateStateKeys = () => {
        const keys = Array.from(state.keys()).filter(key => key !== '__state_keys__');
        state.set('__state_keys__', {
            value: keys,
            timestamp: Date.now(),
            version: version++
        });
    };

    const postResponse = (type: string, payload: any, id?: string) => {
        self.postMessage({ type, payload, id });
    };

    const persistState = async () => {
        const stateObj: Record<string, any> = {};
        for (const [key, data] of state.entries()) {
            if (key !== '__state_keys__') {
                stateObj[key] = data.value;
            }
        }
        await localforage.setItem('app_state', stateObj);
    };

    const handleRead = async (key: string, id?: string) => {
        const stateData = state.get(key);
        postResponse('read', {
            key,
            value: stateData?.value,
            metadata: stateData ? {
                timestamp: stateData.timestamp,
                version: stateData.version
            } : undefined
        }, id);
    };

    const handleWrite = async (payload: { key: string; value: any }, id?: string) => {
        const { key, value } = payload;

        if (key.includes('.')) {
            const parts = key.split('.');
            const rootKey = parts[0];
            const rootData = state.get(rootKey);
            let current = rootData?.value || {};

            let temp = current;
            for (let i = 1; i < parts.length - 1; i++) {
                temp[parts[i]] = temp[parts[i]] || {};
                temp = temp[parts[i]];
            }
            temp[parts[parts.length - 1]] = value;

            state.set(rootKey, {
                value: current,
                timestamp: Date.now(),
                version: version++
            });
        } else {
            state.set(key, {
                value,
                timestamp: Date.now(),
                version: version++
            });
        }

        updateStateKeys();
        await persistState();
        postResponse('write', { success: true }, id);
    };

    const handleUpdate = async (payload: { key: string; value: any }, id?: string) => {
        const { key, value } = payload;
        const existing = state.get(key);

        state.set(key, {
            value: typeof value === 'object' && existing
                ? { ...existing.value, ...value }
                : value,
            timestamp: Date.now(),
            version: version++
        });

        updateStateKeys();
        await persistState();

        const subs = subscribers.get(key) || [];
        if (subs.length > 0) {
            const stateData = state.get(key)!;
            postResponse('notify', {
                key,
                value: stateData.value,
                metadata: {
                    timestamp: stateData.timestamp,
                    version: stateData.version
                },
                subscribers: subs
            });
        }

        postResponse('update', { success: true }, id);
    };

    const handleNotify = (payload: { key: string; subscriber: string }, id?: string) => {
        const { key, subscriber } = payload;
        const subs = subscribers.get(key) || [];
        subscribers.set(key, [...subs, subscriber]);
        postResponse('notify', { success: true }, id);
    };

    const handleRemove = async (key: string, id?: string) => {
        state.delete(key);
        updateStateKeys();
        await persistState();
        postResponse('remove', { success: true }, id);
    };

    const initializeState = async () => {
        try {
            const savedState = await localforage.getItem('app_state');
            if (savedState && typeof savedState === 'object') {
                Object.entries(savedState).forEach(([key, value]) => {
                    state.set(key, {
                        value,
                        timestamp: Date.now(),
                        version: version++
                    });
                });
            }
            updateStateKeys();
            postResponse('ready', { success: true });
        } catch (error) {
            postResponse('ready', {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };

    const handleMessage = async (event: MessageEvent<StateMessage>) => {
        const { type, payload, id } = event.data;

        try {
            switch (type) {
                case 'read':
                    await handleRead(payload, id);
                    break;
                case 'write':
                    await handleWrite(payload, id);
                    break;
                case 'update':
                    await handleUpdate(payload, id);
                    break;
                case 'notify':
                    handleNotify(payload, id);
                    break;
                case 'remove':
                    await handleRemove(payload, id);
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

    self.onmessage = handleMessage;
    initializeState();
};

createStateWorker(); 