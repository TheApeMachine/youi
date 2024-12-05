import { jsx, Fragment } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Button } from "@/lib/ui/button/Button";

interface Props {
    content: JSX.Element;
    children: JSX.Element;
}

export const Popover = Component({
    render: ({ children, content }: Props) => {
        const id = window.crypto.randomUUID();
        return (
            <>
                <Button popovertarget={id}>{children}</Button>
                <div id={id} popover>
                    {content}
                </div>
            </>
        );
    }
});
