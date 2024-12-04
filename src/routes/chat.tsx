import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Profile } from "@/lib/ui/profile/Profile";
import { P2P } from "@/lib/ui/chat/p2p";
import { messaging } from "@/lib/ui/chat/messaging";
import { Input } from "@/lib/ui/chat/Input";
import { stateManager } from "@/lib/state";
import { from } from "@/lib/mongo/query";
import { eventBus, EventPayload } from "@/lib/event";
import { Flex } from "@/lib/ui/Flex";
import { List } from "@/lib/ui/List";
import { Button } from "@/lib/ui/button/Button";

export const render = Component({
    loader: () => {
        const authUser = stateManager.getState("authUser");
        return {
            user: from("User").where({ Auth0UserId: authUser?.sub }).exec()
        };
    },
    effect: () => {
        eventBus.subscribe("group-select", (e: EventPayload) => {
            if (!e.effect) return;

            from("User")
                .whereArrayField("Groups", { _id: e.effect })
                .exec()
                .then((users) => {
                    const groupMemberList =
                        document.getElementById("group-members");
                    if (groupMemberList) {
                        groupMemberList.innerHTML = "";
                        users.forEach(async (groupUser: any) => {
                            groupMemberList.appendChild(
                                await jsx(Profile, { groupUser })
                            );
                        });
                    }
                });
        });

        const { provider, ydoc } = P2P();
        if (!provider) return;

        messaging(provider, ydoc);
    },
    render: ({ data }) => (
        <Flex background="bg" pad="md" gap="unit" fullWidth fullHeight>
            <Flex
                direction="column"
                align="start"
                background="muted"
                radius="xs"
                shrink
            >
                <Flex direction="column" fullWidth>
                    <List
                        items={data.user[0].Groups.filter(
                            (group: any) => group.HasChat
                        ).map((group: any) => (
                            <Button
                                variant="text"
                                color="fg"
                                trigger="click"
                                event="group-select"
                                effect={group._id}
                            >
                                {group.GroupName}
                            </Button>
                        ))}
                    />
                </Flex>
                <Flex direction="column" fullWidth className="scrollable">
                    <List id="group-members" />
                </Flex>
            </Flex>

            <Flex
                className="card-glass"
                border="1px solid var(--muted)"
                direction="column"
                fullWidth
                fullHeight
                background="bg-glass"
                radius="xs"
            >
                <Flex
                    id="messages-container"
                    background="transparent"
                    direction="column"
                    gap="unit"
                    pad="unit"
                    fullWidth
                    fullHeight
                    scrollable
                ></Flex>
                <Input />
            </Flex>
        </Flex>
    )
});
