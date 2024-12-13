import { jsx } from "@/lib/vdom";

export const Main = ({ children }: { children: JSX.Element }) => {
    return (
        <main>
            {children}
        </main>
    );
};
