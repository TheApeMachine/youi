import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import Reveal from "reveal.js";
import { Dialog } from "../dialog/Dialog";
import { Navigation } from "../menu/Navigation";
import { Toaster } from "../toast/Toaster";
import "@dotlottie/player-component";
import { Flyout } from "../Flyout";
import { navigation } from "./navigation";
import { AuthService } from "@/lib/auth";

interface RevealSlideEvent {
    currentSlide: HTMLElement;
    previousSlide: HTMLElement | null;
    indexh: number;
    indexv: number;
}

export const Layout = Component({
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
        <div class="layout">
            <main id="app">
                <div class="reveal">
                    <div class="slides"></div>
                </div>
            </main>
        </div>
    )
});
