import localforage from 'localforage';
import { StateData, StateMessage } from './worker-types';

let sharedWorker: SharedWorker | null = null;

export const getWorker = () => {
  if (!sharedWorker) {
    sharedWorker = new SharedWorker(new URL('./worker.ts', import.meta.url), { 
      type: 'module',
      name: 'state-worker' 
    });
  }
  return sharedWorker;
};

// Map to store message handlers
const messageHandlers = new Map<string, (data: any) => void>();

// Function to register a message handler
export const onWorkerMessage = (type: string, handler: (data: any) => void) => {
    messageHandlers.set(type, handler);
};

// Function to remove a message handler
export const offWorkerMessage = (type: string) => {
    messageHandlers.delete(type);
};

// Function to initialize worker communication
export const initWorkerCommunication = () => {
    const worker = getWorker();
    worker.port.start();

    worker.port.onmessage = (event) => {
        const { type, payload } = event.data;
        const handler = messageHandlers.get(type);
        if (handler) {
            handler(payload);
        }
    };

    // Return cleanup function
    return () => {
        messageHandlers.clear();
        worker.port.close();
    };
};

// Function to send message to worker
export const sendWorkerMessage = (type: string, payload?: any) => {
    const worker = getWorker();
    return new Promise((resolve, reject) => {
        const messageId = crypto.randomUUID();
        
        const handleResponse = (event: MessageEvent) => {
            const { id, type: responseType, payload: responsePayload } = event.data;
            if (id === messageId) {
                worker.port.removeEventListener('message', handleResponse);
                if (responseType === 'error') {
                    reject(new Error(responsePayload.error));
                } else {
                    resolve(responsePayload);
                }
            }
        };

        worker.port.addEventListener('message', handleResponse);
        worker.port.postMessage({ type, payload, id: messageId });
    });
};