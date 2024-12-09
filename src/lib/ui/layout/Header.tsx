import { jsx } from "@/lib/template";

export const Header = ({ children }: { children: JSX.Element }) => {
    return (
        <header>
            {children}
        </header>
    );
};
