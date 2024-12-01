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
import { Flyout } from "../Flyout";

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
    },
    render: async () => (
        <div className="layout">
            <Flyout variant="header" direction="down" />
            <aside className="row center bg">
                <span class="material-symbols-rounded color-fg">
                    arrow_right
                </span>
            </aside>
            <main id="app" className="column center">
                <div className="reveal">
                    <div className="slides"></div>
                </div>
                <span class="material-symbols-rounded">arrow_drop_up</span>
            </main>
            <article class="row center shrink bg-darker flyout">
                <span class="material-symbols-rounded">arrow_left</span>
                <div class="column center pad gap height bg-dark">
                    <Button
                        variant="animoji"
                        icon="videocam"
                        className="icon"
                    />
                    <Button
                        variant="animoji"
                        icon="auto_awesome"
                        className="icon"
                    />
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
