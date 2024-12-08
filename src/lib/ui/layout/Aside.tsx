import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Flex } from "../Flex";
import { Button } from "../button/Button";
import { Icon } from "../icon/Icon";

export const Aside = Component({
    render: () => (
        <aside>
            <Flex direction="column" className="flyout" fullHeight>
                <Button variant="animoji" icon="videocam" className="icon" />
                <Button
                    variant="animoji"
                    icon="auto_awesome"
                    className="icon"
                />
            </Flex>
            <Icon icon="arrow_right" />
        </aside>
    )
});
