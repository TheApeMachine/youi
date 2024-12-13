import { jsx } from "@/lib/vdom";
import { Center, Column, Row } from "@/lib/ui/Flex";
import Icon from "@/lib/ui/icon/Icon";
import { Image } from "@/lib/ui/Image";
import { Link } from "@/lib/ui/Link";
import { Text } from "@/lib/ui/Text";

export default (dbUser: any) => {
    return (
        <Column background="surface" radius grow>
            <Center>
                <Image
                    className="avatar xxl"
                    src={dbUser.user.ImageURL}
                    alt="Avatar"
                />
            </Center>

            <Center grow>
                <Text variant="h3" color="text-default">
                    {`${dbUser.user.FirstName} ${dbUser.user.LastName}`}
                </Text>
            </Center>
            <Row align="end" justify="evenly">
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
