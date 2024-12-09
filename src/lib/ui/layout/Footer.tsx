import { jsx } from "@/lib/template";

export const Footer = ({ children }: { children: JSX.Element }) => {
    return (
        <footer>
            {children}
        </footer>
    );
};
