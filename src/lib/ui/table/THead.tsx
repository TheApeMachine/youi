import { jsx } from "@/lib/vdom";

interface THeadProps {
    children: any[];
}

export const THead = ({ children }: THeadProps) => {
    return (
        <thead>
            <tr>{children}</tr>
        </thead>
    )
}
