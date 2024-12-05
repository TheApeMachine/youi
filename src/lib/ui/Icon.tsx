import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Color } from "@/lib/ui/types";

interface IconProps {
    icon: string;
    color?: Color;
}

export const Icon = Component({
    render: async ({ icon, color = "fg" }: IconProps) => (
        <span class={`material-symbols-rounded icon`}>{icon}</span>
    )
});
