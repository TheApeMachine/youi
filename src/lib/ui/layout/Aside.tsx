import { jsx } from "@/lib/template";

export const Aside = ({ children }: { children: JSX.Element }) => {
    return (
        <aside>
            {children}
        </aside>
    );
};
