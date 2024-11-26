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
            keyboard: false,
            embedded: true,
            disableLayout: true,
            display: "flex"
        }).then(() => {
            const dialog = document.querySelector("dialog");
            const menuItems = document.querySelectorAll("dialog nav a");
            const menuIcon = document.querySelector(".menu-icon");

            // Initially hide menu items
            gsap.set(menuItems, {
                opacity: 0,
                y: -20,
                scale: 0.8
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

            const closeMenu = () => {
                if (!isOpen) return;

                gsap.to(menuItems, {
                    opacity: 0,
                    y: -20,
                    scale: 0.8,
                    duration: 0.3,
                    stagger: 0.03,
                    ease: "power2.in",
                    onComplete: () => {
                        dialog?.close();
                    }
                });

                gsap.to("main", {
                    z: 0,
                    duration: 0.4,
                    ease: "back.out(1.7)"
                });

                isOpen = false;
            };

            const replaceButtons = () => {
                let children: HTMLElement[] = [];
                const nav = document.querySelector("dialog nav");
                [{ label: "Users", icon: "group", href: "/users" }].forEach(
                    (item) => {
                        const a = document.createElement("a");
                        a.href = item.href;
                        a.innerHTML = `
                        <span class="material-icons">${item.icon}</span>
                        <h4>${item.label}</h4>
                    `;
                        children.push(a);
                    }
                );

                nav?.replaceChildren(...children);
            };

            // Handle clicks outside the menu
            dialog?.addEventListener("click", (e) => {
                console.log(e.target);
                if (e.target?.href === "#admin-menu") {
                    replaceButtons();
                    return;
                }

                if (e.target === dialog) {
                    closeMenu();
                }
            });

            // Handle menu item clicks
            menuItems.forEach((item) => {
                item.addEventListener("click", () => {
                    closeMenu();
                });
            });

            eventBus.subscribe("menu", (e: MouseEvent) => {
                if (!isOpen) {
                    // Record the menu icon's position for animation
                    const state = Flip.getState(menuIcon);
                    dialog?.showModal();

                    // Stagger animation for menu items
                    gsap.to(menuItems, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.4,
                        stagger: 0.05,
                        ease: "back.out(1.7)"
                    });

                    // Animate menu icon
                    Flip.from(state, {
                        duration: 0.5,
                        ease: "power1.inOut",
                        scale: true,
                        absolute: true
                    });

                    // Subtle scale animation for the dialog
                    gsap.from(dialog, {
                        scale: 0.9,
                        duration: 0.4,
                        ease: "back.out(1.7)"
                    });

                    gsap.to("main", {
                        z: -250,
                        duration: 0.4,
                        ease: "back.out(1.7)"
                    });
                } else {
                    closeMenu();
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
                    class="material-icons light menu-icon"
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
                    <a href="/" data-event="navigate">
                        <span class="material-icons">home</span>
                        <h4>Home</h4>
                    </a>
                    <a href="/users" data-event="navigate">
                        <span class="material-icons">group</span>
                        <h4>Users</h4>
                    </a>
                    <a href="/products" data-event="navigate">
                        <span class="material-icons">category</span>
                        <h4>Products</h4>
                    </a>
                    <a href="/chat" data-event="navigate">
                        <span class="material-icons">forum</span>
                        <h4>Chat</h4>
                    </a>
                    <a href="/call" data-event="navigate">
                        <span class="material-icons">videocam</span>
                        <h4>Call</h4>
                    </a>
                    <a href="/orgchart" data-event="navigate">
                        <span class="material-icons">lan</span>
                        <h4>Org Chart</h4>
                    </a>
                    <a href="#admin-menu" data-event="navigate">
                        <span class="material-icons">admin_panel_settings</span>
                        <h4>Admin</h4>
                    </a>
                </nav>
            </dialog>
        </div>
    )
});
