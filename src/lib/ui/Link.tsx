import { jsx } from "@/lib/vdom";
import Icon from "./icon/Icon";

interface LinkProps {
    children: Node | Node[];
    href: string;
    icon?: string;
    className?: string;
    background?: string;
}

export const Link = ({
    children,
    href,
    icon,
    background = "transparent",
    className = ""
}: LinkProps) => {
    return (
        <a href={href} className={`link ${background} ${className}`}>
            {icon && <Icon icon={icon} />}
            {children}
        </a>
    );
};
