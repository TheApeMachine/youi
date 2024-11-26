import { jsx } from "@/lib/template"
import { Component } from "@/lib/ui/Component"

interface RenderProps {
    keys: string[]
}

export const THead = Component({
    effect: () => { },
    render: (props: RenderProps) => (
        <thead>
            <tr>
                {props.keys.map((key: string) => <th>{key}</th>)}
                <span class="material-symbols-rounded">csv</span>
                <span class="material-symbols-rounded">add</span>
            </tr>
        </thead>
    )
});