import { jsx, Fragment } from "@/lib/vdom";
import { Input } from "@/lib/ui/chat/Input";
import { Circle } from "@/lib/ui/Circle";
import { Component } from "@/lib/ui/Component";
import { Flex } from "@/lib/ui/Flex";
import { Timeline } from "@/lib/ui/monocle/Timeline";
import { DynamicIsland } from "@/lib/ui/DynamicIsland";
import { Popover } from "@/lib/ui/popover/Popover";
import Button from "@/lib/ui/button/Button";

export const render = () => {
    return (
        <Flex pad="xl" fullWidth fullHeight>
            <Flex></Flex>
            <Flex direction="column" fullWidth fullHeight>
                <DynamicIsland
                    variant="surface"
                    style={{
                        height: "auto"
                    }}
                    main={<Input variant="textarea" />}
                    footer={
                        <Flex>
                            <Button
                                variant="icon"
                                pad="md"
                                icon="add_photo_alternate"
                                color="muted"
                                trigger="click"
                                event="chat"
                                effect="photo"
                                className="photo"
                            />
                            <Button
                                variant="icon"
                                pad="md"
                                icon="mic"
                                color="muted"
                                trigger="click"
                                event="chat"
                                effect="mic"
                                className="mic"
                            />
                            <Popover>
                                <Button
                                    variant="icon"
                                    pad="md"
                                    icon="mood"
                                    color="muted"
                                    trigger="click"
                                    event="chat"
                                    effect="mood"
                                    className="mood"
                                />
                            </Popover>
                        </Flex>
                    }
                />
                <Timeline />
            </Flex>
            <Flex direction="column" fullWidth fullHeight>
                <Circle />
            </Flex>
        </Flex>
    );
};
