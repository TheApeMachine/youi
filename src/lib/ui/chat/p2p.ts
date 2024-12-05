import { eventBus } from "@/lib/event";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { AwarenessState } from "./types";

export enum ConnectionState {
    CONNECTING = "connecting",
    CONNECTED = "connected",
    DISCONNECTED = "disconnected",
    RECONNECTING = "reconnecting",
    FAILED = "failed"
}

export const P2P = () => {

    const ydoc = new Y.Doc()
    let provider: WebsocketProvider | null = null
    let connectionAttempts = 0
    const MAX_CONNECTION_ATTEMPTS = 5
    const RECONNECT_INTERVAL = 3000

    const currentUserId = (): number => {
        if (!provider?.awareness) return 0;
        return provider.awareness.clientID;
    }

    const getCurrentUserState = (): AwarenessState["user"] | null => {
        if (!provider) return null;
        if (!provider?.awareness) return null;
        const state = provider.awareness.getLocalState() as AwarenessState;
        return state?.user ?? null;
    }

    const initializeProvider = (): void => {
        provider = new WebsocketProvider(
            "wss://crdt.fanfactory.io/collaboration",
            "playground/0/0",
            ydoc,
            { connect: true }
        );

        provider.on("status", (status: ConnectionState) => {
            // Use event system to update status.
            switch (status) {
                case "connecting":
                    break;
                case "connected":
                    break;
                case "disconnected":
                    break;
                case "reconnecting":
                    break;
                case "failed":
                    break;
            }
        });

        provider.on("connection-error", (error: Error) => {
            console.error("Connection error:", error);
            handleDisconnect();
        });

        provider.awareness.setLocalStateField("user", {
            name: `User ${Math.floor(Math.random() * 1000)}`,
            color: `#${Math.floor(Math.random() * 16777215).toString(
                16
            )}`
        });
    }

    const handleDisconnect = (): void => {
        connectionAttempts++;
        if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
            const event = new CustomEvent("status", {
                detail: {
                    status: "error",
                    message: "failed to connect to provider"
                }
            });

            eventBus.publish("status", event);
        }

        setTimeout(() => {
            provider?.disconnect();
            initializeProvider();
        }, RECONNECT_INTERVAL);
    }

    initializeProvider();

    return {
        provider,
        currentUserId,
        getCurrentUserState,
        ydoc
    }

};
