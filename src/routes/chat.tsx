import { jsx } from "@/lib/template";
import { Profile } from "@/lib/ui/profile/Profile";
import { P2P } from "@/lib/ui/chat/p2p";
import { messaging } from "@/lib/ui/chat/messaging";
import { Input } from "@/lib/ui/chat/Input";
import { stateManager } from "@/lib/state";
import { from } from "@/lib/mongo/query";
import { eventBus, EventPayload } from "@/lib/event";
import { Column, Flex, Row } from "@/lib/ui/Flex";
import { List } from "@/lib/ui/List";
import Button from "@/lib/ui/button/Button";
import { ListItem } from "@/lib/ui/list/List";

export default async () => {
    const onMount = () => {
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

            const { provider, ydoc } = P2P();
            if (!provider) return;

            messaging(provider, ydoc);
        });
    };

    const authUser = await stateManager.get("authUser");
    const dbUser = await from("User")
        .where({ Auth0UserId: authUser?.sub })
        .limit(1)
        .exec();

    console.log(dbUser);

    return (
        <Row>
            <Column>
                <List>
                    {dbUser?.user?.Groups?.map((group) => (
                        <ListItem>{group.GroupName}</ListItem>
                    ))}
                </List>
            </Column>
        </Row>
    );
};
