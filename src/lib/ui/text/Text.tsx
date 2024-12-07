import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface TextProps {
    variant?: "h1" | "h2" | "h3" | "h4" | "body" | "caption";
    children?: string | number;
}

export const Text = Component({
    render: ({ variant = "body", children }: TextProps) => {
        const tag = variant.startsWith("h") ? variant : "p";
        return jsx(tag, { className: `text text-${variant}` }, children);
    }
});
