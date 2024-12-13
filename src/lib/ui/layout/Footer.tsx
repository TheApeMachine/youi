import { jsx } from "@/lib/vdom";

export const Footer = ({ children }: { children: JSX.Element }) => {
    return (
        <footer>
            {children}
        </footer>
    );
};
