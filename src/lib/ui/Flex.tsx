import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Unit, Color, Radius } from "@/lib/ui/types";

interface FlexProps {
    children?: Node | Node[];
    direction?: "row" | "column";
    grow?: boolean;
    align?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "space-between" | "space-around";
    justifySelf?: "start" | "center" | "end" | "stretch";
    shrink?: boolean;
    gap?: Unit;
    pad?: Unit;
    radius?: Radius;
    background?: Color;
    fullWidth?: boolean;
    fullHeight?: boolean;
    className?: string;
    id?: string;
    scrollable?: boolean;
    border?: string;
    contentEditable?: boolean;
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
        className = "",
        id = window.crypto.randomUUID(),
        scrollable = false,
        border = "",
        contentEditable = false
    }: FlexProps) => {
        const radiusStyle = radius ?
            radius.startsWith('bottom-') ? `border-bottom-left-radius: var(--${radius.replace('bottom-', '')}); border-bottom-right-radius: var(--${radius.replace('bottom-', '')})` :
                radius.startsWith('top-') ? `border-top-left-radius: var(--${radius.replace('top-', '')}); border-top-right-radius: var(--${radius.replace('top-', '')})` :
                    `border-radius: var(--${radius})` : '';

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
            radiusStyle,
            background && `background: var(--${background})`,
            scrollable && "overflow-y: auto",
            border && `border: ${border}`,
        ]
            .filter(Boolean)
            .join(";");

        return (
            <div style={style} class={className} id={id} contentEditable={contentEditable}>
                {children && children}
            </div>
        );
    }
});
