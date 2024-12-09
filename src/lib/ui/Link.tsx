import { jsx } from "@/lib/template";

interface LinkProps {
    children: Node | Node[];
    href: string;
    className?: string;
}

export const Link = ({ children, href, className = "" }: LinkProps) => {
    return (
        <a href={href} className={className}>
            {children}
        </a>
    );
}
