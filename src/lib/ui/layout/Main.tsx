import { jsx } from "@/lib/template";

export const Main = ({ children }: { children: JSX.Element }) => {
    return (
        <main>
            {children}
        </main>
    );
};
