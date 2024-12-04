import { eventBus } from "@/lib/event";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface RenderProps {
    children: any[];
}

export const TBody = Component({
    render: ({ children }: RenderProps) => {
        return <tbody>{children}</tbody>;
    }
});
