import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "@/lib/event";

type ButtonProps = {
    variant: "menu" | "button" | "icon";
    icon?: string;
    label?: string;
    href?: string;
    effect?: string;
    trigger?: string;
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
        children
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
            case "icon":
                return (
                    <button
                        data-trigger={trigger}
                        data-event="menu"
                        data-effect={effect}
                        class="icon"
                    >
                        <span class="material-icons" data-trigger="click">
                            {icon}
                        </span>
                    </button>
                );
        }
    }
});
