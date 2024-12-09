import { jsx } from "@/lib/template";
import { Background } from "./types";

export type ListProps = {
    items?: JSX.Element[];
    id?: string;
    zebra?: boolean;
    background?: Background;
};

export const List = ({ items, id, zebra, background }: ListProps) => {
    return (
        <ul id={id} className={`list ${zebra ? "zebra" : ""} ${background}`}>
            {items?.map((item: JSX.Element) => (
                <li data-trigger="click" data-event="list" data-effect={item}>
                    {item}
                </li>
            ))}
        </ul>
    );
};
