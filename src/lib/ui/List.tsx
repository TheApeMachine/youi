import { jsx } from "@/lib/template";

export type ListProps = {
    items?: JSX.Element[];
    id?: string;
};

export const List = ({ items, id }: ListProps) => {
    return (
        <ul id={id} class="list">
            {items?.map((item: JSX.Element) => (
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
