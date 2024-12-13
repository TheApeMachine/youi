import { eventBus } from "@/lib/event";
import { WebsocketProvider } from "y-websocket";
import { ChatMessage, Reaction, Thread } from "./types";
import { Doc } from "yjs";
import * as Y from "yjs";
import { ConnectionState } from "./p2p";
import { Message } from "./Message";
import { jsx } from "@/lib/vdom";

interface StatusEventInit {
    status: ConnectionState;
    message: string;
}

function* messageGenerator(messages: Y.Array<ChatMessage>, provider: WebsocketProvider) {
    let index = 0;
    const messageArray = messages.toArray();

    while (index < messageArray.length) {
        const message = messageArray[index];
        const isCurrentUser = message.sender === provider?.awareness?.clientID;

        yield {
            message,
            isCurrentUser
        };

        index++;
    }
}

export const messaging = (
    provider: WebsocketProvider,
    ydoc: Doc
) => {
    const messages = ydoc.getArray<ChatMessage>("messages");
    const reactions = ydoc.getMap<Reaction>("reactions");
    const threads = ydoc.getMap<Thread>("threads");

    const renderMessages = async () => {
        const container = document.getElementById("messages-container");
        if (!container) return;

        const messageGen = messageGenerator(messages, provider);

        // Clear existing messages
        container.innerHTML = '';

        // Render messages in chunks
        for (const { message, isCurrentUser } of messageGen) {
            const messageElement = await jsx(Message, {
                message,
                isCurrentUser,
                provider,
                reactions,
                getCurrentUserId: () => provider?.awareness?.clientID || 0,
                addThreadReply: () => { }, // Implement thread reply logic if needed
            });
            container.appendChild(messageElement);
        }
    };

    // Subscribe to message updates
    messages.observe(() => {
        renderMessages();
    });

    eventBus.subscribe("send-message", (event: CustomEvent) => {
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

    // Initial render
    renderMessages();
}
