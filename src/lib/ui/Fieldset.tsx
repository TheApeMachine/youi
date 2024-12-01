import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const Fieldset = Component({
    render: ({
        legend,
        children
    }: {
        legend: string;
        children: Node | Node[];
    }) => (
        <fieldset>
            <legend>{legend}</legend>
            {children}
        </fieldset>
    )
});
