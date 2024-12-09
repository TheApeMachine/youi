import { jsx } from "@/lib/template";
import { Link } from "@/lib/ui/Link";
import { List } from "@/lib/ui/List";
import { Text } from "@/lib/ui/Text";
import { DynamicIslandVariant } from "@/lib/ui/dynamic-island/variants";

// Export the variant for this island
export const variant: DynamicIslandVariant = "menu";

export const Header = async () => {
    return (
        <Text variant="h2">Menu</Text>
    );
}

export const Main = async () => {
    return (
        <List items={[
            <Link href="/dashboard"><Text>Dashboard</Text></Link>,
            <Link href="/profile"><Text>Profile</Text></Link>,
            <Link href="/settings"><Text>Settings</Text></Link>
        ]} />
    );
}