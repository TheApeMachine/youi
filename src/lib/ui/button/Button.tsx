import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Player } from "../animoji/Player";

type ButtonProps = {
    variant: "menu" | "button" | "icon" | "animoji" | "brand";
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
        icon,
        label,
        href,
        effect,
        trigger,
        children,
        className
    }: ButtonProps) => {
        switch (variant) {
            case "menu":
                return (
                    <a
                        href={href}
                        class="menu-button"
                        data-trigger="click"
                        data-event="menu"
                        data-effect={variant === "menu" ? "submenu" : "close"}
                        data-topic={href}
                    >
                        <div class="button-face">
                            <span class="material-icons">{icon}</span>
                            <h4>{label}</h4>
                        </div>
                        {children ?? ""}
                    </a>
                );
            case "button":
                return (
                    <button
                        data-trigger="click"
                        data-event="menu"
                        data-effect="submenu"
                        data-topic={href}
                    >
                        <div class="button-face">
                            <span class="material-icons">{icon}</span>
                            <h4>{label}</h4>
                            <span
                                class="material-icons close"
                                data-trigger="click"
                                data-event="menu"
                                data-effect="close"
                            >
                                arrow_back
                            </span>
                        </div>
                        {children ?? ""}
                    </button>
                );
            case "brand":
                return (
                    <button
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
            case "icon":
                return (
                    <button
                        data-trigger={trigger}
                        data-event={event}
                        data-effect={effect}
                        class="icon"
                    >
                        <span
                            class="material-symbols-rounded"
                            data-trigger="click"
                        >
                            {icon}
                        </span>
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
                        <span class={`material-icons ${className}`}>
                            {icon}
                        </span>
                        <Player animoji={icon} />
                    </div>
                );
        }
    }
});
