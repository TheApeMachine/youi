import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Unit, Background, Radius } from "@/lib/ui/types";

interface FlexProps {
    children?: Node | Node[];
    direction?: "row" | "column";
    grow?: boolean;
    align?: "start" | "center" | "end" | "stretch";
    alignSelf?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "space-between" | "space-around";
    justifySelf?: "start" | "center" | "end" | "stretch";
    textAlign?: "left" | "center" | "right";
    shrink?: boolean;
    gap?: Unit;
    pad?: Unit;
    radius?: Radius;
    background?: Background;
    gradient?: "dark";
    fullWidth?: boolean;
    fullHeight?: boolean;
    className?: string;
    id?: string;
    scrollable?: boolean;
    border?: string;
    contentEditable?: boolean;
}

const getRadiusStyle = (radius: Radius | undefined): string => {
    if (!radius) return "";

    const value = radius.replace(/^(bottom-|top-)/, "");
    if (radius.startsWith("bottom-")) {
        return `border-bottom-left-radius: var(--${value}); border-bottom-right-radius: var(--${value})`;
    }
    if (radius.startsWith("top-")) {
        return `border-top-left-radius: var(--${value}); border-top-right-radius: var(--${value})`;
    }
    return `border-radius: var(--${radius})`;
};

export const Flex = Component({
    render: ({
        children,
        direction = "row",
        grow = true,
        align = "center",
        alignSelf = "center",
        justify = "center",
        justifySelf = "center",
        textAlign = "center",
        shrink = false,
        background,
        gradient,
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
        const radiusStyle = getRadiusStyle(radius);

        const style = [
            "display: flex",
            `flex-direction: ${direction}`,
            align && `align-items: ${align}`,
            alignSelf && `align-self: ${alignSelf}`,
            justify && `justify-content: ${justify}`,
            justifySelf && `justify-self: ${justifySelf}`,
            grow && "flex: 1",
            shrink && "flex: 0",
            fullWidth && "width: 100%",
            fullHeight && "height: 100%",
            gap && `gap: var(--${gap})`,
            pad && `padding: var(--${pad})`,
            radiusStyle,
            background &&
                !className.includes("random-image") &&
                `background: var(--${background})`,
            scrollable && "overflow-y: auto",
            border && `border: ${border}`,
            gradient && `background-image: var(--gradient-${gradient})`,
            textAlign && `text-align: ${textAlign}`
        ]
            .filter(Boolean)
            .join(";");

        return (
            <div
                style={style}
                class={className}
                id={id}
                contentEditable={contentEditable}
            >
                {children && children}
            </div>
        );
    }
});
