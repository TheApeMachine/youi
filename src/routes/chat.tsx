import { jsx } from "@/lib/template";
import { Profile } from "@/lib/ui/profile/Profile";
import { P2P } from "@/lib/ui/chat/p2p";
import { messaging } from "@/lib/ui/chat/messaging";
import { Input } from "@/lib/ui/chat/Input";
import { stateManager } from "@/lib/state";
import { from } from "@/lib/mongo/query";
import { eventBus } from "@/lib/event";
import { Column } from "@/lib/ui/Flex";
import { List, ListItem } from "@/lib/ui/list/List";
import { User } from "@/types/mongo/User";
import { Badge } from "@/lib/ui/Badge";
import { Text } from "@/lib/ui/Text";
import { Grid, GridItem } from "@/lib/ui/grid/Grid";
import { Message } from "@/lib/ui/chat/Message";

interface Auth0User {
    sub: string;
}

export default async () => {
    const authUser = await stateManager.get<Auth0User>("authUser");
    const dbUser = (await from("User")
        .where({ Auth0UserId: authUser?.sub })
        .limit(1)
        .exec()) as User[];

    const chatGroups = dbUser?.Groups?.filter((g) => g.HasChat) || [];

    eventBus.subscribe(
        "group-select",
        (payload: { type: string; data: any }) => {
            console.log(payload);
            if (!payload.data) return;

            from("Message")
                .include("Chat")
                .whereArrayField("ChatId", "in", chatIds)
                .sortBy("Created", "desc")
                .limit(20)
                .exec()
                .then((messages) => {
                    console.log(messages);
                    const chatMessages =
                        document.getElementById("chat-messages");
                    if (chatMessages) {
                        chatMessages.innerHTML = "";
                        messages.forEach(async (message) => {
                            chatMessages.appendChild(
                                await jsx(Message, { message })
                            );
                        });
                    }
                });

            from("Group")
                .where({ _id: payload.data })
                .include("User")
                .exec()
                .then((groups) => {
                    if (groups && groups.length > 0) {
                        const group = groups[0];
                        const groupMemberList =
                            document.getElementById("group-members");
                        if (groupMemberList && group.user) {
                            groupMemberList.innerHTML = "";
                            group.user.forEach(async (groupUser: User) => {
                                groupMemberList.appendChild(
                                    await jsx(Profile, { groupUser })
                                );
                            });
                        }
                    }
                });

            const { provider, ydoc } = P2P();
            if (!provider) return;
            messaging(provider, ydoc);
        }
    );

    return (
        <Grid columns="1fr 2fr" gap="xxl" grow>
            <GridItem column="1" direction="column" gap="md">
                <List gap="xs" pad="md">
                    {chatGroups.map((group) => (
                        <ListItem
                            onClick={() => {
                                eventBus.publish(
                                    "group",
                                    "group-select",
                                    group._id
                                );
                            }}
                            pad="sm"
                            background="bg"
                            radius="xs"
                        >
                            <Text
                                variant="span"
                                icon="group"
                                color="text-primary"
                            >
                                {group.GroupName}
                            </Text>
                            <Badge color="brand-light">
                                <Text color="highlight">3</Text>
                            </Badge>
                        </ListItem>
                    ))}
                </List>
                <List id="group-members" gap="xs" pad="md">
                    <ListItem>
                        <Text>Create Group</Text>
                    </ListItem>
                </List>
            </GridItem>
            <GridItem
                column="2"
                direction="column"
                background="gradient-vertical"
                pad="xxl"
                radius="sm"
                fullHeight
                grow
            >
                <Column
                    id="chat-messages"
                    direction="column"
                    pad="xl"
                    gap="xl"
                    grow
                    fullHeight
                    scrollable
                ></Column>
                <Input />
            </GridItem>
        </Grid>
    );
};
