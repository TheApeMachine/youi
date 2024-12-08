import { jsx } from "@/lib/template";
import { Color } from "@/lib/ui/types";

interface IconProps {
    icon: string;
    color?: Color;
}

export const Icon = ({ icon, color = "fg" }: IconProps) => (
    <span class={`material-symbols-rounded icon`}>{icon}</span>
);
