import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import Reveal from "reveal.js";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { Dialog } from "../dialog/Dialog";
import { Navigation } from "../menu/Navigation";
import { Toaster } from "../toast/Toaster";
import "@dotlottie/player-component";
import { Header } from "./Header";
import { Button } from "../button/Button";

gsap.registerPlugin(Flip);

interface RevealSlideEvent {
    currentSlide: HTMLElement;
    previousSlide: HTMLElement | null;
    indexh: number;
    indexv: number;
}

interface LayoutProps {}

/* Layout Component - A wrapper component for page content */
export const Layout = Component<LayoutProps>({
    effect: () => {
        Reveal.initialize({
            hash: false,
            respondToHashChanges: false,
            history: false,
            transition: "convex",
            loop: false,
            keyboard: false,
            embedded: true,
            disableLayout: true,
            display: "flex"
        }).then(() => {
            window.Reveal = Reveal;
            (Reveal as any).on("slidechanged", (event: RevealSlideEvent) => {
                const path = event.currentSlide?.dataset.path;
                if (path && window.location.pathname !== path) {
                    history.pushState(null, "", path);
                }
            });
        });

        if (window.location.pathname === "/dashboard") return;
        const offset = 80;

        gsap.set(".topbar", { marginTop: -offset });
        gsap.set(".flyout", { marginRight: -offset });
        let isAnimating = false;

        const shouldOpen = (evt: MouseEvent) => {
            const isCloseToTop = evt.clientY < offset / 4;
            const isCloseToRight = evt.clientX > window.innerWidth - offset / 4;

            if (isCloseToTop || !!(evt.target as HTMLElement)?.closest('.topbar')) {
                return ".topbar"
            } else if (isCloseToRight || !!(evt.target as HTMLElement)?.closest('.flyout')) {
                return ".flyout"
            }

            return null;
        };

        window.addEventListener("mousemove", (evt: MouseEvent) => {
            if (isAnimating) return;

            const target = shouldOpen(evt);
            isAnimating = true;

            gsap.to(".topbar", {
                marginTop: target === ".topbar" ? 0 : -offset,
                duration: 0.5,
                ease: "back.out(1.7)",
                onComplete: () => { isAnimating = false; }
            });

            gsap.to(".flyout", {
                marginRight: target === ".flyout" ? 0 : -offset,
                duration: 0.5,
                ease: "back.out(1.7)",
                onComplete: () => { isAnimating = false; }
            });
        });
    },
    render: async () => (
        <div className="layout">
            <Header />
            <aside></aside>
            <main id="app">
                <div className="reveal">
                    <div className="slides"></div>
                </div>
            </main>
            <article class="row center shrink bg-darker flyout">
                <span class="material-icons">chevron_left</span>
                <div class="column center pad gap height bg-dark">
                    <Button variant="animoji" icon="videocam" className="icon" />
                    <Button variant="animoji" icon="auto_awesome" className="icon" />
                </div>
            </article>
            <footer>
                <p>
                    YouI &copy; 2024{" "}
                    <a href="https://theapemachine.com" target="_blank">
                        The Ape Machine
                    </a>
                </p>
            </footer>
            <Dialog>
                <Navigation
                    items={[
                        {
                            href: "/dashboard",
                            icon: "dashboard",
                            label: "Dashboard"
                        },
                        {
                            href: "/orgchart",
                            icon: "lan",
                            label: "Orgchart"
                        },
                        {
                            href: "/chat",
                            icon: "chat",
                            label: "Chat"
                        },
                        {
                            href: "/admin",
                            icon: "settings",
                            label: "Admin",
                            submenu: [
                                {
                                    href: "/admin/tenants",
                                    icon: "apartment",
                                    label: "Tenants"
                                },
                                {
                                    href: "/admin/users",
                                    icon: "people",
                                    label: "Users"
                                },
                                {
                                    href: "/admin/timeline",
                                    icon: "timeline",
                                    label: "Timeline"
                                },
                                {
                                    href: "/admin/feedback",
                                    icon: "feedback",
                                    label: "Feedback"
                                }
                            ]
                        }
                    ]}
                />
            </Dialog>
            <Toaster />
        </div>
    )
});
