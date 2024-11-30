import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import Reveal from "reveal.js";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { Dialog } from "../dialog/Dialog";
import { Navigation } from "../menu/Navigation";
import { Toaster } from "../toast/Toaster";
import "@dotlottie/player-component";
import { Player } from "../animoji/Player";
import { Header } from "./Header";

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
        console.log("Layout effect");
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
                console.log("slidechanged", event);
                const path = event.currentSlide?.dataset.path;
                if (path && window.location.pathname !== path) {
                    history.pushState(null, "", path);
                }
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
            <article></article>
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
