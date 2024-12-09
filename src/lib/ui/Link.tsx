import { jsx } from "@/lib/template";

interface LinkProps {
    children: Node | Node[];
    href: string;
    className?: string;
    background?: string;
}

export const Link = ({
    children,
    href,
    background = "transparent",
    className = ""
}: LinkProps) => {
    return (
        <a href={href} className={`link ${background} ${className}`}>
            {children}
        </a>
    );
};
