import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Player } from "../animoji/Player";
import { Color, Background } from "../types";

type ButtonProps = {
    variant: "brand" | "icon" | "animoji";
    color?: Color;
    background?: Background;
    type?: "button" | "submit" | "reset";
    className?: string;
    icon?: string;
    label?: string;
    href?: string;
    trigger?: string;
    event?: string;
    effect?: string;
    children?: Node | Node[];
};

export const Button = Component({
    effect: () => {},
    render: ({
        variant,
        color = "fg",
        background = "transparent",
        type = "button",
        icon,
        effect,
        trigger,
        event,
        children,
        className
    }: ButtonProps) => {
        switch (variant) {
            case "brand":
                return (
                    <button
                        type={type}
                        style={`gap: var(--xs); color: var(--highlight)`}
                        class="brand"
                        data-trigger={trigger}
                        data-event={event}
                        data-effect={effect}
                    >
                        {icon && (
                            <span class="material-symbols-rounded">{icon}</span>
                        )}
                        {children ?? ""}
                    </button>
                );
            case "animoji":
                return (
                    <div
                        class="animoji"
                        data-trigger="click"
                        data-event="menu"
                        data-effect="open"
                    >
                        <span class={`material-symbols-rounded ${className}`}>
                            {icon}
                        </span>
                        <Player animoji={icon} />
                    </div>
                );
            default:
                return (
                    <button
                        data-trigger={trigger}
                        data-event={event}
                        data-effect={effect}
                        style={`color: var(--${color}); background-color: var(--${background}, transparent)`}
                        class={`icon`}
                    >
                        <span
                            class="material-symbols-rounded"
                            data-trigger="click"
                        >
                            {icon}
                        </span>
                        {children}
                    </button>
                );
        }
    }
});
