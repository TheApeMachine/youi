/// <reference lib="webworker" />
declare const self: SharedWorkerGlobalScope;

import localforage from 'localforage';

interface StateData {
    value: any;
    timestamp: number;
    version: number;
}

interface StateMessage {
    type: 'ready' | 'read' | 'write' | 'update' | 'notify' | 'remove';
    payload: any;
    id?: string;
}

// Track all connected ports
const ports = new Set<MessagePort>();

// Shared state between all connections
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

const postResponse = (type: string, payload: any, id?: string, targetPort?: MessagePort) => {
    const message = { type, payload, id };
    if (targetPort) {
        targetPort.postMessage(message);
    } else {
        // Broadcast to all ports
        ports.forEach(port => port.postMessage(message));
    }
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

const handleRead = async (key: string, id?: string, port?: MessagePort) => {
    const stateData = state.get(key);
    postResponse('read', {
        key,
        value: stateData?.value,
        metadata: stateData ? {
            timestamp: stateData.timestamp,
            version: stateData.version
        } : undefined
    }, id, port);
};

const handleWrite = async (payload: { key: string; value: any }, id?: string, port?: MessagePort) => {
    try {
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
        postResponse('write', { success: true }, id, port);
    } catch (error) {
        postResponse('error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        }, id, port);
    }
};

const handleUpdate = async (payload: { key: string; value: any }, id?: string, port?: MessagePort) => {
    try {
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
            ports.forEach(port => {
                postResponse('notify', {
                    key,
                    value: stateData.value,
                    metadata: {
                        timestamp: stateData.timestamp,
                        version: stateData.version
                    }
                }, undefined, port);
            });
        }

        postResponse('update', { success: true }, id, port);
    } catch (error) {
        postResponse('error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        }, id, port);
    }
};

const handleNotify = (payload: { key: string; subscriber: string }, id?: string, port?: MessagePort) => {
    const { key, subscriber } = payload;
    const subs = subscribers.get(key) || [];
    subscribers.set(key, [...subs, subscriber]);
    postResponse('notify', { success: true }, id, port);
};

const handleRemove = async (key: string, id?: string, port?: MessagePort) => {
    try {
        state.delete(key);
        updateStateKeys();
        await persistState();
        postResponse('remove', { success: true }, id, port);
    } catch (error) {
        postResponse('error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        }, id, port);
    }
};

const initializeState = async (port: MessagePort) => {
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
        postResponse('ready', { success: true }, undefined, port);
    } catch (error) {
        postResponse('ready', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, undefined, port);
    }
};

const handleMessage = async (event: MessageEvent<StateMessage>, port: MessagePort) => {
    const { type, payload, id } = event.data;

    try {
        switch (type) {
            case 'ready':
                postResponse('ready', { success: true }, id);
                break;
            case 'read':
                await handleRead(payload, id, port);
                break;
            case 'write':
                await handleWrite(payload, id, port);
                break;
            case 'update':
                await handleUpdate(payload, id, port);
                break;
            case 'notify':
                handleNotify(payload, id, port);
                break;
            case 'remove':
                await handleRemove(payload, id, port);
                break;
            default:
                throw new Error(`Unknown message type: ${type}`);
        }
    } catch (error) {
        postResponse('error', {
            error: error instanceof Error ? error.message : 'Unknown error'
        }, id, port);
    }
};

// Handle new connections
self.onconnect = (e) => {
    const port = e.ports[0];
    ports.add(port);

    port.onmessage = (event) => handleMessage(event, port);

    // Initialize state for new connection
    initializeState(port);

    port.start();

    // Cleanup when port is closed
    port.onmessageerror = () => {
        ports.delete(port);
    };
};