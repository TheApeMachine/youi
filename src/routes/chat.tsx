import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Profile } from "@/lib/ui/profile/Profile";
import { P2P } from "@/lib/ui/chat/p2p";
import { messaging } from "@/lib/ui/chat/messaging";
import { eventBus, EventPayload } from "@/lib/event";

export const render = Component({
    effect: () => {
        const { provider, ydoc } = P2P();
        if (!provider) return;

        const { sendMessage } = messaging(provider, ydoc);

        eventBus.subscribe("send-message", (event: EventPayload) => {
            if (event.effect === "send-message") {

                sendMessage();
            }
        });
    },
    render: () => (
        <div class="row height">
            <div class="members-panel">
                {[...Array(10)].map(() => (
                    <Profile />
                ))}
            </div>
            <div class="chat-container grow">
                <div class="connection-status"></div>
                <span class="material-icons start-videocall pointer">
                    videocam
                </span>
                <div id="messages-container" class="scroll"></div>
                <div class="input-container">
                </div>
            </div>
        </div>
    )
});
