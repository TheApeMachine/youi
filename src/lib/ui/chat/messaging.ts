import { eventBus } from "@/lib/event";
import { WebsocketProvider } from "y-websocket";
import { ChatMessage, Reaction, Thread } from "./types";
import { Doc } from "yjs";
import { ConnectionState } from "./p2p";

interface StatusEventInit {
    status: ConnectionState;
    message: string;
}

export const messaging = (
    provider: WebsocketProvider,
    ydoc: Doc
) => {
    const messages = ydoc.getArray<ChatMessage>("messages");
    const reactions = ydoc.getMap<Reaction>("reactions");
    const threads = ydoc.getMap<Thread>("threads");

    eventBus.subscribe("send-message", (event: CustomEvent) => {
        console.log("send-message", event);
        if (event.detail) {
            if (!provider?.wsconnected) {
                const event = new CustomEvent("status", {
                    detail: {
                        variant: "error",
                        title: ConnectionState.DISCONNECTED,
                        message: "cannot send message while disconnected"
                    }
                });

                eventBus.publish("status", event);
                return;
            }

            messages.insert(messages.length, [event.detail]);
        }
    });
}