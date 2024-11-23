import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import Reveal from 'reveal.js';

interface LayoutProps {
    children?: JSX.Element;
}

/** Layout Component - A wrapper component for page content */
export const Layout = Component<LayoutProps>({
    effect: () => {
        console.log("Layout effect");
        Reveal.initialize({
            hash: true,
            respondToHashChanges: true,
            history: true,
            transition: "convex",
            loop: true,
            embedded: true
        });
    },
    render: async ({ children }) => (
        <div className="reveal">
            <div className="slides">
                {children}
            </div>
        </div>
    )
});
