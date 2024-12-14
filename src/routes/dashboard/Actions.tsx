import { jsx } from "@/lib/vdom";
import { Badge } from "@/lib/ui/Badge";
import Icon from "@/lib/ui/icon/Icon";
import { Link } from "@/lib/ui/Link";
import { List, ListItem } from "@/lib/ui/list/List";
import { Text } from "@/lib/ui/Text";

export default () => (
    <List zebra background="gradient-vertical">
        <ListItem>
            <Link href="/chat" icon="mail">
                <Text variant="span">Messages</Text>
                <Badge color="brand-light">
                    <Text color="highlight">3</Text>
                </Badge>
            </Link>
        </ListItem>
        <ListItem>
            <Link href="/chat" icon="emoji_objects" background="important">
                <Text variant="span">Recommendations</Text>
                <Badge color="brand-light">
                    <Text color="highlight">3</Text>
                </Badge>
            </Link>
        </ListItem>
        <ListItem>
            <Link href="/dashboard/profile" icon="send">
                <Text variant="span">Invitations</Text>
                <Badge color="brand-light">
                    <Text color="highlight">3</Text>
                </Badge>
            </Link>
        </ListItem>
        <ListItem>
            <Link href="/dashboard/logout" icon="calendar_month">
                <Text variant="span">Events</Text>
                <Badge color="brand-light">
                    <Text color="highlight">3</Text>
                </Badge>
            </Link>
        </ListItem>
        <ListItem>
            <Link href="/account">
                <Icon icon="settings" />
                <Text variant="span">Account Settings</Text>
            </Link>
        </ListItem>
        <ListItem>
            <Link href="/statistics">
                <Icon icon="monitoring" />
                <Text variant="span">Statistics</Text>
            </Link>
        </ListItem>
    </List>
);
