import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Profile } from "@/lib/ui/profile/Profile";
import { P2P } from "@/lib/ui/chat/p2p";
import { messaging } from "@/lib/ui/chat/messaging";
import { Input } from "@/lib/ui/chat/Input";
import { stateManager } from "@/lib/state";
import { from } from "@/lib/mongo/query";
import { eventBus, EventPayload } from "@/lib/event";
import { Button } from "@/lib/ui/button/Button";

export const render = Component({
    loader: () => {
        const authUser = stateManager.getState("authUser");
        return {
            user: from("User").where({ Auth0UserId: authUser?.sub }).exec(),
            // You can add more queries here and they'll be cached automatically
            // messages: from("Message").where({ channelId: someId }).exec(),
        };
    },
    effect: () => {
        eventBus.subscribe("group-select", (e: EventPayload) => {
            if (!e.effect) return;

            console.log("group-select", e);
            from("User")
                .whereArrayField("Groups", { _id: e.effect })
                .exec()
                .then(users => {
                    console.log("Found users:", users);
                    const groupMemberList = document.getElementById("group-members");
                    if (groupMemberList) {
                        groupMemberList.innerHTML = "";
                        users.forEach(async (groupUser: any) => {
                            groupMemberList.appendChild(await jsx(
                                Profile, { groupUser }
                            ));
                        });
                    }
                });
        });

        const { provider, ydoc } = P2P();
        if (!provider) return;

        messaging(provider, ydoc);
    },
    render: ({ data }) => (
        <div class="row height pad-xl gap-xl">
            <div class="column start shrink height gap">
                <div class="column width scrollable">
                    <ul class="list">
                        {data.user[0].Groups.filter((group: any) => group.HasChat).map((group: any) => (
                            <li
                                data-trigger="click"
                                data-event="group-select"
                                data-effect={group._id}>
                                {group.GroupName}
                            </li>
                        ))}
                    </ul>
                </div>
                <div class="column height width scrollable">
                    <ul class="list" id="group-members">
                    </ul>
                </div>
            </div>
            <div class="column grow height pad-xl bg-dark radius shadow-page">
                <div
                    id="messages-container"
                    class="column center grow height scroll"
                >
                </div>
                <div class="column shrink radius-xs ring-darker shadow-tile">
                    <Input />
                </div>
            </div>
        </div>
    )
});
