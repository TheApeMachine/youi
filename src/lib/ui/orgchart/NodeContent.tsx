import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Flex } from "../Flex";

export const NodeContent = Component({
    effect: () => {
    },
    render: async (props: any) => (
        <Flex>
            <h1>{props.data.name}</h1>
        </Flex>
    )
});
