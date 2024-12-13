import { jsx } from "@/lib/vdom";

interface TFootProps {
    children: JSX.Element[];
}

export const TFoot = ({ children }: TFootProps) => {
    return <tfoot>{children}</tfoot>
}
