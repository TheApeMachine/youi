import { jsx } from "@/lib/vdom";
import { Badge } from "@/lib/ui/Badge";
import Icon from "@/lib/ui/icon/Icon";
import { Link } from "@/lib/ui/Link";
import { List } from "@/lib/ui/List";
import { Text } from "@/lib/ui/Text";

export default () => (
    <List
        zebra
        background="gradient-vertical"
        items={[
            <Link href="/chat">
                <Text icon="mail">Messages</Text>
                <Badge color="brand-light">
                    <Text color="highlight">
                        3
                    </Text>
                </Badge>
            </Link>,
            <Link href="/chat" background="important">
                <Text icon="emoji_objects" iconColor="yellow">
                    Recommendations
                </Text>
                <Badge color="brand-light">
                    <Text color="highlight">
                        3
                    </Text>
                </Badge>
            </Link>,
            <Link href="/dashboard/profile">
                <Text icon="send">Invitations</Text>
                <Badge color="brand-light">
                    <Text color="highlight">
                        3
                    </Text>
                </Badge>
            </Link>,
            <Link href="/dashboard/logout">
                <Text icon="calendar_month">Events</Text>
                <Badge color="brand-light">
                    <Text color="highlight">
                        3
                    </Text>
                </Badge>
            </Link>,
            <Link href="/account">
                <Icon icon="settings" />
                Account Settings
            </Link>,
            <Link href="/statistics">
                <Icon icon="monitoring" />
                Statistics
            </Link>
        ]}
    />
);
