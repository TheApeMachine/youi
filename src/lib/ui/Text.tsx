import { jsx } from "@/lib/template";
import { Color } from "@/lib/ui/types";
import { Icon } from "@/lib/ui/Icon";

interface TextProps {
    id?: string;
    interactive?: boolean;
    variant?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "sub";
    color?: Color;
    icon?: typeof Icon;
    className?: string;
    children?: string;
}

export const Text = ({
    id,
    interactive,
    variant = "p",
    color = "fg",
    icon,
    className = "",
    children = ""
}: TextProps) => {
    const props = {
        id,
        style: `color: var(--${color})`,
        class: `text text-${variant} ${className}`,
        "data-interactive": interactive
    };

    switch (variant) {
        case "h1": return <h1 {...props}>{icon && <Icon icon={icon} />}{children}</h1>;
        case "h2": return <h2 {...props}>{icon && <Icon icon={icon} />}{children}</h2>;
        case "h3": return <h3 {...props}>{icon && <Icon icon={icon} />}{children}</h3>;
        case "h4": return <h4 {...props}>{icon && <Icon icon={icon} />}{children}</h4>;
        case "h5": return <h5 {...props}>{icon && <Icon icon={icon} />}{children}</h5>;
        case "h6": return <h6 {...props}>{icon && <Icon icon={icon} />}{children}</h6>;
        case "sub": return <sub {...props}>{icon && <Icon icon={icon} />}{children}</sub>;
        default: return <p {...props}>{icon && <Icon icon={icon} />}{children}</p>;
    }
};
