import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Button } from "../button/Button";
import { Avatar } from "../profile/Avatar";
import { Icon } from "../Icon";
import { Flex } from "../Flex";

export const Header = Component({
    render: async () => {
        return (
            <header>
                <Flex pad="md" justify="space-between" fullWidth>
                    <Flex grow={false}>
                        <Button
                            variant="animoji"
                            icon="rocket"
                            className="icon xl"
                        />
                    </Flex>
                    <Flex grow={false}>
                        <Avatar />
                        <Button variant="animoji" icon="notifications" />
                    </Flex>
                </Flex>
                <Icon icon="arrow_drop_down" />
            </header>
        );
    }
});
