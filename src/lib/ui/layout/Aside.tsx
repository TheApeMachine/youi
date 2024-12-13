import { jsx } from "@/lib/vdom";

export const Aside = ({ children }: { children: JSX.Element }) => {
    return (
        <aside>
            {children}
        </aside>
    );
};
