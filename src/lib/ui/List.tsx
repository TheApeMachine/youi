import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export type ListProps = {
    items: JSX.Element[];
};

export const List = Component({
    render: async ({ items }) => {
        return (
            <ul class="list">
                {items.map((item: JSX.Element) => (
                    <li
                        data-trigger="click"
                        data-event="list"
                        data-effect={item}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        );
    }
});
