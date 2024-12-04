import { jsx } from "../template";
import { Component } from "./Component";

interface TableProps {
    children: JSX.Element[];
    collection?: string;
}

export const Table = Component({
    render: (props: TableProps) => <table>{props.children}</table>
});
