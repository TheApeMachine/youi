import { jsx } from "@/lib/template";
import { Column, Row } from "@/lib/ui/Flex";
import Icon from "@/lib/ui/icon/Icon";
import { Link } from "@/lib/ui/Link";
import { Text } from "@/lib/ui/Text";

export default (user: any) => {
    return (
        <Column background="surface" radius grow>
            <Column grow>
                <Text variant="h3" color="highlight">
                    {user.name}
                </Text>
            </Column>
            <Row align="end" justify="space-evenly">
                <Link
                    href="/dashboard/profile"
                    className="accent-button yellow"
                >
                    <Icon icon="forum" /> 6
                </Link>
                <Link href="/dashboard/profile" className="accent-button green">
                    <Icon icon="visibility" />
                    14
                </Link>
                <Link href="/dashboard/profile" className="accent-button red">
                    <Icon icon="favorite" />
                    22
                </Link>
            </Row>
        </Column>
    );
};
