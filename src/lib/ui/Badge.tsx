import { jsx } from "@/lib/template";
import { Color } from "@/lib/ui/types";

interface BadgeProps {
    children: Node | Node[];
    color?: Color;
}

export const Badge = ({ children, color = "brand" }: BadgeProps) => {
    return <span class={`badge ${color}`}>{children}</span>;
};
