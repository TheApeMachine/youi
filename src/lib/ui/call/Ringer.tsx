import { eventBus, EventPayload } from "@/lib/event";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { faker } from "@faker-js/faker";

export const Ringer = Component({
    effect: () => {
        eventBus.subscribe("call", (payload: EventPayload) => {
            if (payload.effect === "hangup") {
                document.querySelector(".incoming")?.remove();
            }
        });
    },
    render: () => (
        <div class="column center gap front ring-darker incoming">
            <div class="row shrink">
                <div class="rainbow">
                    <img
                        class="avatar xl"
                        src={faker.image.avatar()}
                        alt="avatar"
                    />
                </div>
                <h3 class="darker">John Doe</h3>
            </div>
            <div class="row shrink call-buttons radius-bottom-xs">
                <div
                    class="accent-button green border-right pointer"
                    data-trigger="click"
                    data-event="call"
                    data-effect="ring"
                >
                    <span class="material-icons pulse green">call</span>
                </div>
                <div
                    class="accent-button red pointer"
                    data-trigger="click"
                    data-event="call"
                    data-effect="hangup"
                >
                    <span class="material-icons red nopointer">call_end</span>
                </div>
            </div>
        </div>
    )
});
