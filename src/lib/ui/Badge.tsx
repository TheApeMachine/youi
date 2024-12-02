import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Color } from "@/lib/ui/types";

interface BadgeProps {
    children: Node | Node[];
    color?: Color;
}

export const Badge = Component({
    render: ({ children, color = "brand" }: BadgeProps) => {
        const style = [`background-color: var(--${color})`]
            .filter(Boolean)
            .join(";");

        return (
            <span class="badge" style={style}>
                {children}
            </span>
        );
    }
});
