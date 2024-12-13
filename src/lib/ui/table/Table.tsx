import { jsx } from "@/lib/vdom";

interface TableProps {
    children: JSX.Element[];
    collection?: string;
}

export const Table = ({ children, collection }: TableProps) => {
    return (
        <table data-collection={collection}>
            {children}
        </table>
    )
}
