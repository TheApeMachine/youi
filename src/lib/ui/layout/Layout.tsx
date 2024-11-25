import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "@/lib/event";
import Reveal from "reveal.js";
import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

interface LayoutProps {}

/* Layout Component - A wrapper component for page content */
export const Layout = Component<LayoutProps>({
    effect: () => {
        Reveal.initialize({
            hash: true,
            respondToHashChanges: true,
            history: true,
            transition: "convex",
            loop: true,
            embedded: true,
            disableLayout: true,
            display: "flex"
        }).then(() => {
            const tl = gsap.timeline();
            const dialog = document.querySelector("dialog");
            const menuItems = document.querySelectorAll("dialog nav a");
            const radius = 150; // Radius of the circular menu

            // Initially hide menu items
            gsap.set(menuItems, {
                opacity: 0,
                scale: 0,
                transformOrigin: "center center"
            });

            for (const element of ["header", "footer"]) {
                gsap.set(element, {
                    opacity: 0,
                    height: 0,
                    padding: 0,
                    overflow: "hidden"
                });
            }

            gsap.set("aside", {
                opacity: 0,
                width: 0,
                padding: 0,
                overflow: "hidden",
                duration: 1.5,
                ease: "power1.inOut"
            });

            let isOpen = false;

            eventBus.subscribe("menu", (e: MouseEvent) => {
                if (!isOpen) {
                    dialog?.showModal();

                    // Create circular animation for menu items
                    menuItems.forEach((item, index) => {
                        const angle = (index / menuItems.length) * Math.PI * 2;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        gsap.to(item, {
                            x,
                            y,
                            opacity: 1,
                            scale: 1,
                            duration: 0.5,
                            delay: index * 0.1,
                            ease: "back.out(1.7)"
                        });
                    });

                    // Rotate the entire nav
                    gsap.to("dialog nav", {
                        rotation: 360,
                        duration: 20,
                        repeat: -1,
                        ease: "none"
                    });

                    // Counter-rotate items to keep them upright
                    gsap.to(menuItems, {
                        rotation: -360,
                        duration: 20,
                        repeat: -1,
                        ease: "none"
                    });
                } else {
                    // Collapse animation
                    gsap.to(menuItems, {
                        x: 0,
                        y: 0,
                        opacity: 0,
                        scale: 0,
                        duration: 0.3,
                        ease: "back.in(1.7)",
                        onComplete: () => {
                            dialog?.close();
                            gsap.killTweensOf("dialog nav");
                            gsap.killTweensOf(menuItems);
                            gsap.set("dialog nav", { rotation: 0 });
                            gsap.set(menuItems, { rotation: 0 });
                        }
                    });
                }

                isOpen = !isOpen;
            });
        });
    },
    render: async () => (
        <div className="layout">
            <header>
                <h1>YouI</h1>
            </header>
            <aside>
                <span className="material-icons">rocket</span>
            </aside>
            <main id="app">
                <span
                    data-trigger="click"
                    data-event="menu"
                    className="material-icons menu-icon"
                >
                    menu
                </span>
                <div className="reveal">
                    <div className="slides"></div>
                </div>
            </main>
            <article></article>
            <footer>
                <p>YouI &copy; 2024 The Ape Machine</p>
            </footer>
            <dialog>
                <nav>
                    <a href="/">
                        <span class="material-icons">home</span>
                        <h4>Home</h4>
                    </a>
                    <a href="/users">
                        <span class="material-icons">group</span>
                        <h4>Users</h4>
                    </a>
                    <a href="/products">
                        <span class="material-icons">category</span>
                        <h4>Products</h4>
                    </a>
                    <a href="/chat">
                        <span class="material-icons">forum</span>
                        <h4>Chat</h4>
                    </a>
                    <a href="/call">
                        <span class="material-icons">videocam</span>
                        <h4>Call</h4>
                    </a>
                </nav>
            </dialog>
        </div>
    )
});
