import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Unit, Color } from "@/lib/ui/types";

interface FlexProps {
    children: Node | Node[];
    direction?: "row" | "column";
    grow?: boolean;
    align?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "space-between" | "space-around";
    justifySelf?: "start" | "center" | "end" | "stretch";
    shrink?: boolean;
    gap?: Unit;
    pad?: Unit;
    radius?: Unit;
    background?: Color;
    fullWidth?: boolean;
    fullHeight?: boolean;
    className?: string;
}

export const Flex = Component({
    render: ({
        children,
        direction = "row",
        grow = true,
        align = "center",
        justify = "center",
        justifySelf = "center",
        shrink = false,
        background = "muted",
        gap,
        pad,
        radius,
        fullWidth = false,
        fullHeight = false,
        className = ""
    }: FlexProps) => {
        const style = [
            "display: flex",
            `flex-direction: ${direction}`,
            align && `align-items: ${align}`,
            justify && `justify-content: ${justify}`,
            justifySelf && `justify-self: ${justifySelf}`,
            grow && "flex: 1",
            shrink && "flex: 0",
            fullWidth && "width: 100%",
            fullHeight && "height: 100%",
            gap && `gap: var(--${gap})`,
            pad && `padding: var(--${pad})`,
            radius && `border-radius: var(--${radius})`,
            background && `background: var(--${background})`
        ]
            .filter(Boolean)
            .join(";");

        return (
            <div style={style} class={className}>
                {children}
            </div>
        );
    }
});
