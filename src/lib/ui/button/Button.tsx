import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Player } from "../animoji/Player";
import { Color, Background, Unit } from "../types";
import { Icon } from "../Icon";

type ButtonProps = {
    variant: "brand" | "icon" | "animoji" | "button" | "text" | "keypad";
    color?: Color;
    background?: Background;
    type?: "button" | "submit" | "reset";
    className?: string;
    icon?: string;
    trigger?: string;
    event?: string;
    effect?: string;
    topic?: string;
    children?: Node | Node[];
    popovertarget?: string;
    pad?: Unit;
};

export const Button = Component({
    effect: (props: ButtonProps & { rootElement: HTMLElement }) => {
        if (props.popovertarget) {
            console.log("popovertarget", props.popovertarget);
            (props.rootElement as any).popovertarget = props.popovertarget;
        }
    },
    render: ({
        variant,
        color = "fg",
        background = "transparent",
        type = "button",
        icon,
        effect,
        trigger,
        event,
        topic,
        children,
        className,
        pad
    }: ButtonProps) => {
        const style = [pad && `padding: var(--${pad})`]
            .filter(Boolean)
            .join(";");

        switch (variant) {
            case "brand":
                return (
                    <button
                        type={type}
                        style={`gap: var(--xs); color: var(--highlight); ${style}`}
                        class="brand"
                        data-trigger={trigger}
                        data-event={event}
                        data-effect={effect}
                        data-topic={topic}
                    >
                        {icon && <Icon icon={icon} color={color} />}
                        {children ?? ""}
                    </button>
                );
            case "animoji":
                return (
                    <div
                        class="animoji"
                        data-trigger="click"
                        data-event="dialog"
                        data-effect="open"
                        style={style}
                    >
                        {icon && <Icon icon={icon} color={color} />}
                        {icon && <Player data={{ animoji: icon }} />}
                    </div>
                );
            case "keypad":
                return (
                    <button
                        data-trigger={trigger}
                        data-event={event}
                        data-effect={effect}
                        data-topic={topic}
                        class={`keypad ${className ?? ""}`}
                        style={style}
                    >
                        {icon && <Icon icon={icon} color={color} />}
                        {children}
                    </button>
                );
            case "text":
                return (
                    <button
                        data-trigger={trigger}
                        data-event={event}
                        data-effect={effect}
                        data-topic={topic}
                        style={`color: var(--${color}); background-color: var(--${background}, transparent); ${style}`}
                        class={`text ${className ?? ""}`}
                    >
                        {children}
                    </button>
                );
            default:
                return (
                    <button
                        data-trigger={trigger}
                        data-event={event}
                        data-effect={effect}
                        data-topic={topic}
                        style={`color: var(--${color}); background-color: var(--${background}, transparent); ${style}`}
                        class={`icon ${className ?? ""}`}
                    >
                        {icon && <Icon icon={icon} color={color} />}
                        {children}
                    </button>
                );
        }
    }
});
