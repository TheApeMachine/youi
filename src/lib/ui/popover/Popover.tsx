import { jsx } from "@/lib/vdom";
import Button from "@/lib/ui/button/Button";

interface Props {
    content: JSX.Element;
    children: JSX.Element;
}

export const Popover = ({ children, content }: Props) => {
    const id = window.crypto.randomUUID();
    return (
        <>
            <Button data-popover-target={id}>{children}</Button>
            <div id={id} popover>
                {content}
            </div>
        </>
    );
};
