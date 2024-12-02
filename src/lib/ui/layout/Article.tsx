import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Button } from "@/lib/ui/button/Button";
import { Flex } from "../Flex";
import { Icon } from "../Icon";

export const Article = Component({
    render: async () => (
        <article>
            <Icon icon="arrow_left" />
            <Flex direction="column" className="flyout" fullHeight>
                <Button variant="animoji" icon="videocam" className="icon" />
                <Button
                    variant="animoji"
                    icon="auto_awesome"
                    className="icon"
                />
            </Flex>
        </article>
    )
});
