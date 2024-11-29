import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Profile } from "@/lib/ui/profile/Profile";
import { P2P } from "@/lib/ui/chat/p2p";
import { messaging } from "@/lib/ui/chat/messaging";
import { eventBus, EventPayload } from "@/lib/event";
import { Input } from "@/lib/ui/chat/Input";
import { Ringer } from "@/lib/ui/call/Ringer";

export const render = Component({
    effect: () => {
        const { provider, ydoc } = P2P();
        if (!provider) return;

        const { sendMessage } = messaging(provider, ydoc);

        eventBus.subscribe("send-message", (event: EventPayload) => {
            console.log("send-message", event);
            if (event.effect === "send-message") {
                sendMessage();
            }
        });
    },
    render: () => (
        <div class="row height pad-xl gap-xl">
            <div class="members-panel">
                {[...Array(10)].map(() => (
                    <Profile />
                ))}
            </div>
            <div class="column grow height pad-xl bg-dark radius shadow-page">
                <div class="column stick-right">
                    <span class="material-icons start-videocall pointer pad">
                        videocam
                    </span>
                    <span class="material-icons start-videocall pointer pad">
                        auto_awesome
                    </span>
                </div>
                <div
                    id="messages-container"
                    class="column center grow height scroll"
                >
                    <Ringer />
                </div>
                <div class="column shrink radius-xs ring-darker shadow-tile">
                    <Input />
                </div>
            </div>
        </div>
    )
});
