import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const Details = Component({
    render: ({
        summary,
        children
    }: {
        summary: string;
        children: Node | Node[];
    }) => (
        <details>
            <summary>{summary}</summary>
            {children}
        </details>
    )
});
