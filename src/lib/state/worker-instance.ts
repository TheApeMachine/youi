import { reject } from "cypress/types/bluebird";

let sharedWorker: SharedWorker | null = null;

export const getWorker = () => {
    if (!sharedWorker) {
        sharedWorker = new SharedWorker(new URL("@/lib/state/worker.ts", import.meta.url), {
            type: "module",
            name: "state-worker"
        });
    }

    return sharedWorker;
};

const initWorker = async () => {
    sharedWorker = getWorker();
    sharedWorker.port.start();

    sharedWorker.port.onmessage = (event) => {
        const { type, payload, id } = event.data;

        // TODO: Handle the message
    };

    await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => reject(new Error("Worker not ready")), 5000);

        const onReady = (event: MessageEvent) => {
            if (event.data.type === "ready") {
                clearTimeout(timeout);
                sharedWorker?.port.removeEventListener("message", onReady);
                resolve();
            }
        };

        if (!sharedWorker) return;
        sharedWorker.port.onmessage = onReady;
    });
};