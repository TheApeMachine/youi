import { jsx } from "@/lib/vdom";
import { Profile } from "@/lib/ui/profile/Profile";
import { P2P } from "@/lib/ui/chat/p2p";
import { messaging } from "@/lib/ui/chat/messaging";
import { Input } from "@/lib/ui/chat/Input";
import { stateManager } from "@/lib/state";
import { from } from "@/lib/mongo/query";
import { Column } from "@/lib/ui/Flex";
import { List, ListItem } from "@/lib/ui/list/List";
import { User } from "@/types/mongo/User";
import { Badge } from "@/lib/ui/Badge";
import { Text } from "@/lib/ui/Text";
import { Grid, GridItem } from "@/lib/ui/grid/Grid";
import { Message } from "@/lib/ui/chat/Message";
import { Message as MessageType } from "@/types/mongo/Message";

interface Auth0User {
    sub: string;
}

export default async () => {
    const authUser = await stateManager.get<Auth0User>("authUser");
    const dbUser = (await from("User")
        .where({ Auth0UserId: authUser?.sub })
        .limit(1)
        .exec()) as User | null;

    const chatGroups = dbUser?.Groups?.filter((g) => g.HasChat) || [];

    await stateManager.set("selectedGroupId", null);

    const selectedGroupId = await stateManager.get("selectedGroupId");

    const getGroup = async (groupId: string) => {
        console.log("Getting group:", groupId);
        const group = await from("Group")
            .include("Chat.Message")
            .where({ _id: groupId })
            .exec({ stateKey: `group:${groupId}` });

        console.log("Group data:", group);
        return group;
    };

    return (
        <Grid columns="1fr 2fr" gap="xxl" grow>
            <GridItem column="1" direction="column">
                <List gap="xs" pad="md">
                    {chatGroups.map((group) => (
                        <ListItem
                            onClick={() => getGroup(group._id)}
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
                <List gap="xs" pad="md">
                    {(
                        await stateManager.get<User[]>(
                            `members:${selectedGroupId}`
                        )
                    )?.map((user) => (
                        <Profile groupUser={user} />
                    ))}
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
                <Column pad="xl" gap="xl" grow fullHeight scrollable>
                    {(
                        await stateManager.get<MessageType[]>(
                            `messages:${selectedGroupId}`
                        )
                    )?.map((message) => (
                        <Message message={message} />
                    ))}
                </Column>
                <Input />
            </GridItem>
        </Grid>
    );
};
