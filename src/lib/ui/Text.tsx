import { jsx } from "@/lib/vdom";
import { Color } from "@/lib/ui/types";
import Icon from "@/lib/ui/icon/Icon";

interface TextProps {
    id?: string;
    interactive?: boolean;
    variant?:
    | "p"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "sub"
    | "span"
    | undefined;
    color?: string;
    iconColor?: Color;
    icon?: string;
    className?: string;
    children?: string;
    text?: "left" | "center" | "right";
}

export const Text = ({
    id,
    interactive,
    variant,
    color = "fg",
    icon,
    iconColor,
    className = "",
    children = "",
    text = "left"
}: TextProps) => {
    const props = {
        id,
        class: `text text-${variant} ${className} text-${text} ${color}`,
        "data-interactive": interactive
    };

    switch (variant) {
        case "h1":
            return (
                <h1 {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </h1>
            );
        case "h2":
            return (
                <h2 {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </h2>
            );
        case "h3":
            return (
                <h3 {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </h3>
            );
        case "h4":
            return (
                <h4 {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </h4>
            );
        case "h5":
            return (
                <h5 {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </h5>
            );
        case "h6":
            return (
                <h6 {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </h6>
            );
        case "p":
            return (
                <p {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </p>
            );
        case "sub":
            return (
                <sub {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </sub>
            );
        case "span":
            return (
                <span {...props}>
                    {icon && <Icon icon={icon} color={iconColor} />}
                    {children}
                </span>
            );
        default:
            return children;
    }
};
