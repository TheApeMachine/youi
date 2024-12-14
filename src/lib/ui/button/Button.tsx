import { jsx } from "@/lib/vdom";
import Icon from "@/lib/ui/icon/Icon";

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
    const baseClass = "button";
    const variantClass = `${baseClass}-${variant}`;
    const colorClass = `${baseClass}-${color}`;
    const sizeClass = `${baseClass}-${size}`;
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

    const buttonIcon = loading ? "sync" : icon;

    return (
        <button
            type={type}
            class={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {buttonIcon && <Icon icon={buttonIcon} color={color} />}
            {children}
        </button>
    );
};
