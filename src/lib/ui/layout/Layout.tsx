import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "@/lib/event";
import Reveal from "reveal.js";
import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

interface LayoutProps { }

/* Layout Component - A wrapper component for page content */
export const Layout = Component<LayoutProps>({
    effect: () => {
        Reveal.initialize({
            hash: true,
            respondToHashChanges: true,
            history: true,
            transition: "convex",
            loop: true,
            keyboard: true,
            embedded: true,
            disableLayout: true,
            display: "flex"
        }).then(() => {
            const dialog = document.querySelector("dialog");
            const initialMenuItems = document.querySelectorAll("dialog nav > a:not(.sub-menu a)");
            const menuIcon = document.querySelector(".menu-icon");
            const initialSubMenu = document.querySelector(".sub-menu");

            // Initially hide menu items and sub-menu
            gsap.set(initialMenuItems, {
                opacity: 0,
                y: -20,
                scale: 0.8
            });

            // Hide sub-menu
            gsap.set(initialSubMenu, {
                display: 'none'
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

                gsap.to(initialMenuItems, {
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
                const nav = document.querySelector("dialog nav") as HTMLElement;
                const mainMenuItems = Array.from(document.querySelectorAll("dialog nav > a:not(.sub-menu a)"));
                const adminMenu = document.querySelector(".sub-menu");
                const adminMenuItems = Array.from(adminMenu?.children || []);

                if (!adminMenuItems.length || !nav) return;

                // Store original menu items for restoration
                const originalMenu = mainMenuItems.map(item => item.cloneNode(true));
                nav.setAttribute('data-original-menu', JSON.stringify(
                    originalMenu.map(node => (node as HTMLElement).outerHTML)
                ));

                // Hide current menu items
                gsap.to(mainMenuItems, {
                    opacity: 0,
                    y: -20,
                    scale: 0.8,
                    duration: 0.3,
                    stagger: 0.03,
                    ease: "power2.in",
                    onComplete: () => {
                        // Clear current menu items except sub-menu
                        mainMenuItems.forEach(item => {
                            if (!item.classList.contains('sub-menu')) {
                                item.remove();
                            }
                        });

                        // Add back button
                        const backButton = document.createElement("a");
                        backButton.href = "#back";
                        backButton.innerHTML = `
                            <span class="material-icons">arrow_back</span>
                            <h4>Back</h4>
                        `;
                        nav.prepend(backButton);

                        // Show admin menu items
                        adminMenuItems.forEach(item => {
                            const clone = item.cloneNode(true);
                            nav.appendChild(clone);
                        });

                        gsap.from("dialog nav a", {
                            opacity: 0,
                            y: 20,
                            scale: 0.8,
                            duration: 0.4,
                            stagger: 0.05,
                            ease: "back.out(1.7)"
                        });
                    }
                });
            };

            const restoreMainMenu = () => {
                const nav = document.querySelector("dialog nav") as HTMLElement;
                const originalMenu = nav?.getAttribute('data-original-menu');
                
                if (!nav || !originalMenu) return;

                const currentItems = document.querySelectorAll("dialog nav > a");

                // Hide current items
                gsap.to(currentItems, {
                    opacity: 0,
                    y: -20,
                    scale: 0.8,
                    duration: 0.3,
                    stagger: 0.03,
                    ease: "power2.in",
                    onComplete: () => {
                        // Clear current menu
                        currentItems.forEach(item => item.remove());

                        // Restore original menu
                        const menuItems = JSON.parse(originalMenu) as string[];
                        menuItems.forEach((html: string) => {
                            const div = document.createElement('div');
                            div.innerHTML = html;
                            nav.appendChild(div.firstChild as Node);
                        });

                        // Show restored menu items
                        gsap.from("dialog nav > a", {
                            opacity: 0,
                            y: 20,
                            scale: 0.8,
                            duration: 0.4,
                            stagger: 0.05,
                            ease: "back.out(1.7)"
                        });
                    }
                });
            };

            // Style updates for menu items
            const allMenuItems = document.querySelectorAll("dialog nav a");
            allMenuItems.forEach(item => {
                (item as HTMLElement).style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    margin-bottom: 8px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    transition: background 0.2s ease;
                `;

                // Add hover effect
                item.addEventListener('mouseenter', () => {
                    gsap.to(item, {
                        background: 'rgba(255, 255, 255, 0.1)',
                        duration: 0.2
                    });
                });
                item.addEventListener('mouseleave', () => {
                    gsap.to(item, {
                        background: 'rgba(255, 255, 255, 0.05)',
                        duration: 0.2
                    });
                });

                // Style the icon and text
                const icon = item.querySelector('.material-icons');
                const text = item.querySelector('h4');
                if (icon) {
                    (icon as HTMLElement).style.marginRight = '8px';
                }
                if (text) {
                    text.style.margin = '0';
                }
            });

            // Update dialog nav styles
            const dialogNav = document.querySelector("dialog nav");
            if (dialogNav) {
                (dialogNav as HTMLElement).style.cssText = `
                    display: flex;
                    flex-direction: column;
                    padding: 16px;
                    min-width: 240px;
                `;
            }

            // Update sub-menu styles
            const menuContainer = document.querySelector(".sub-menu");
            if (menuContainer) {
                (menuContainer as HTMLElement).style.cssText = `
                    display: none;
                    grid-template-columns: 1fr;
                    gap: 8px;
                    margin-top: 8px;
                `;
            }

            // Update dialog click handler
            dialog?.addEventListener("click", (e) => {
                const target = e.target as HTMLElement;
                const menuLink = target.closest('a');
                const href = menuLink?.getAttribute("href");

                if (href === "#admin-menu") {
                    e.preventDefault();
                    e.stopPropagation();
                    replaceButtons();
                    return;
                } else if (href === "#back") {
                    e.preventDefault();
                    e.stopPropagation();
                    restoreMainMenu();
                    return;
                } else if (target === dialog) {
                    closeMenu();
                }
            });

            eventBus.subscribe("menu", (e: MouseEvent) => {
                if (!isOpen) {
                    // Record the menu icon's position for animation
                    const state = Flip.getState(menuIcon);
                    dialog?.showModal();

                    // Stagger animation for menu items
                    gsap.to(initialMenuItems, {
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
                    <a href="#admin-menu" data-event="navigate" class="button-menu">
                        <span class="material-icons">admin_panel_settings</span>
                        <h4>Admin</h4>
                    </a>
                    <div class="sub-menu" style="display: none;">
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
                    </div>
                </nav>
            </dialog>
        </div>
    )
});
