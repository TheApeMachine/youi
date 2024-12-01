import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const Flex = Component({
    render: ({
        children,
        direction = "row",
        align = "center",
        justify = "center"
    }: {
        children: Node | Node[];
        direction: string;
        align: string;
        justify: string;
    }) => <div class={`flex ${direction} ${align} ${justify}`}>{children}</div>
});
