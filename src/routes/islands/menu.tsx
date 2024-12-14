import { jsx } from "@/lib/vdom";
import { Link } from "@/lib/ui/Link";
import { List, ListItem } from "@/lib/ui/list/List";
import { Text } from "@/lib/ui/Text";

export default async ({ params }: { params?: { id: string } }) => {
    if (!params?.id) {
        throw new Error("Island ID is required");
    }

    return (
        <List>
            <ListItem>
                <Link href="/dashboard">
                    <Text>Dashboard</Text>
                </Link>
            </ListItem>
            <ListItem>
                <Link href="/profile">
                    <Text>Profile</Text>
                </Link>
            </ListItem>
            <ListItem>
                <Link href="/settings">
                    <Text>Settings</Text>
                </Link>
            </ListItem>
        </List>
    );
};
