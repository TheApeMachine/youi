import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Color } from "@/lib/ui/types";
import { Icon } from "@/lib/ui/Icon";

interface TextProps {
    variant?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "sub";
    color?: Color;
    icon?: typeof Icon;
    className?: string;
    children: string;
}

export const Text = Component({
    render: ({
        variant = "p",
        color = "fg",
        icon,
        className,
        children
    }: TextProps) => {
        switch (variant) {
            case "h1":
                return (
                    <h1
                        style={`color: var(--${color})`}
                        class={`text text-h1 ${className}`}
                    >
                        {icon && <Icon icon={icon} />}
                        {children}
                    </h1>
                );
            case "h2":
                return (
                    <h2
                        style={`color: var(--${color})`}
                        class={`text text-h2 ${className}`}
                    >
                        {icon && <Icon icon={icon} />}
                        {children}
                    </h2>
                );
            case "h3":
                return (
                    <h3
                        style={`color: var(--${color})`}
                        class={`text text-h3 ${className}`}
                    >
                        {icon && <Icon icon={icon} />}
                        {children}
                    </h3>
                );
            case "h4":
                return (
                    <h4
                        style={`color: var(--${color})`}
                        class={`text text-h4 ${className}`}
                    >
                        {icon && <Icon icon={icon} />}
                        {children}
                    </h4>
                );
            case "h5":
                return (
                    <h5
                        style={`color: var(--${color})`}
                        class={`text text-h5 ${className}`}
                    >
                        {icon && <Icon icon={icon} />}
                        {children}
                    </h5>
                );
            case "h6":
                return (
                    <h6
                        style={`color: var(--${color})`}
                        class={`text text-h6 ${className}`}
                    >
                        {icon && <Icon icon={icon} />}
                        {children}
                    </h6>
                );
            case "sub":
                return (
                    <sub
                        style={`color: var(--${color})`}
                        class={`text text-sub ${className}`}
                    >
                        {icon && <Icon icon={icon} />}
                        {children}
                    </sub>
                );
            default:
                return (
                    <p
                        style={`color: var(--${color})`}
                        class={`text text-body ${className}`}
                    >
                        {icon && <Icon icon={icon} />}
                        {children}
                    </p>
                );
        }
    }
});
