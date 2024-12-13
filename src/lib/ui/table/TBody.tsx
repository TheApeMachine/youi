import { jsx } from "@/lib/vdom";

interface RenderProps {
    children: any[];
}

export const TBody = ({ children }: RenderProps) => {
    return <tbody>{children}</tbody>;
}
