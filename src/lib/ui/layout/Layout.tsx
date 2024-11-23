import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import Reveal from "reveal.js";
import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

interface LayoutProps {}

/** Layout Component - A wrapper component for page content */
export const Layout = Component<LayoutProps>({
    effect: () => {
        Reveal.initialize({
            hash: true,
            respondToHashChanges: true,
            history: true,
            transition: "convex",
            loop: true,
            embedded: true,
            disableLayout: true
        }).then(() => {
            const tl = gsap.timeline();

            for (const element of ["header", "footer"]) {
                tl.to(
                    element,
                    {
                        opacity: 0,
                        height: 0,
                        padding: 0,
                        overflow: "hidden",
                        duration: 1.5,
                        ease: "power1.inOut"
                    },
                    "<"
                );
            }

            tl.to(
                "aside",
                {
                    opacity: 0,
                    width: 0,
                    padding: 0,
                    overflow: "hidden",
                    duration: 1.5,
                    ease: "power1.inOut"
                },
                "<"
            );

            tl.play();
        });
    },
    render: async () => (
        <div className="layout">
            <header>
                <h1>YouI</h1>
            </header>
            <aside>
                <span class="material-icons">rocket</span>
                <nav>
                    <a href="/">
                        <span class="material-icons">home</span>
                        <h4>Home</h4>
                    </a>
                    <a href="/">
                        <span class="material-icons">group</span>
                        <h4>Users</h4>
                    </a>
                    <a href="/products">
                        <span class="material-icons">category</span>
                        <h4>Products</h4>
                    </a>
                </nav>
            </aside>
            <main id="app">
                <span className="material-icons menu-icon">menu</span>
                <div className="reveal">
                    <div className="slides"></div>
                </div>
            </main>
            <article></article>
            <footer>
                <p>YouI &copy; 2024 The Ape Machine</p>
            </footer>
        </div>
    )
});
