import { jsx } from "@/lib/template";

export const Article = ({ children }: { children: JSX.Element }) => {
    return (
        <article>
            {children}
        </article>
    );
};
