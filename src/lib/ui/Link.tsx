import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface LinkProps {
    children: Node | Node[];
    href: string;
    className?: string;
}

export const Link = Component({
    render: ({ children, href, className = "" }: LinkProps) => {
        return (
            <a href={href} className={className}>
                {children}
            </a>
        );
    }
});
