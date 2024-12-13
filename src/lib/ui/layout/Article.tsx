import { jsx } from "@/lib/vdom";

export const Article = ({ children }: { children: JSX.Element }) => {
    return (
        <article>
            {children}
        </article>
    );
};
