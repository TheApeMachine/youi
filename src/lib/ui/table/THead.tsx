import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface THeadProps {
    children: any[];
}

export const THead = Component({
    render: ({ children = [] }: THeadProps) => {
        return (
            <thead>
                <tr>{children}</tr>
            </thead>
        );
    }
});
