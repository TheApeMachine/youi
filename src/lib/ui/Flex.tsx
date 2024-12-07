import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const Flex = Component({
    render: ({
        className,
        children
    }: {
        className?: string;
        children: Node | Node[];
    }) => {
        return <div class={className}>{children}</div>;
    }
});

export const Row = Component({
    render: ({ children }: { children: Node | Node[] }) => (
        <Flex className="row-box">{children}</Flex>
    )
});

export const Column = Component({
    render: ({ children }: { children: Node | Node[] }) => (
        <Flex className="column-box">{children}</Flex>
    )
});

export const Center = Component({
    render: ({ children }: { children: Node | Node[] }) => (
        <Flex className="center-box">{children}</Flex>
    )
});
