import { jsx } from "@/lib/template";
import { createEventProps } from "@/lib/event/dom";
import { Icon } from "@/lib/ui/icon/Icon";

export type ButtonVariant =
    | "primary"
    | "secondary"
    | "icon"
    | "text"
    | "animoji"
    | "submit";
export type ButtonColor = "brand" | "muted" | "danger" | "success";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
    variant?: ButtonVariant;
    color?: ButtonColor;
    size?: ButtonSize;
    icon?: string;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
    children?: any;
    onClick?: (event: MouseEvent) => void;
    type?: "button" | "submit" | "reset";
}

export default async ({
    variant = "primary",
    color = "brand",
    size = "md",
    icon,
    disabled = false,
    loading = false,
    className = "",
    children,
    onClick,
    type = variant === "submit" ? "submit" : "button",
    ...props
}: ButtonProps) => {
    const eventProps = createEventProps("button");
    const baseClass = "button";
    const variantClass = `${baseClass}--${variant}`;
    const colorClass = `${baseClass}--${color}`;
    const sizeClass = `${baseClass}--${size}`;
    const classes = [
        baseClass,
        variantClass,
        colorClass,
        sizeClass,
        disabled && "disabled",
        loading && "loading",
        className
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            class={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...eventProps}
            {...props}
        >
            {icon && <Icon icon={icon} color={color} />}
            {children}
            {loading && (
                <span class="loading-indicator">
                    <Icon icon="sync" color={color} />
                </span>
            )}
        </button>
    );
};
