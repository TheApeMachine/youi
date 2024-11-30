import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { stateManager } from "@/lib/state";
import { AuthService } from "@/lib/auth";
import { Button } from "../button/Button";
import { Player } from "../animoji/Player";
import gsap from "gsap";

export const Header = Component({
    effect: ({ rootElement }) => {
        if (window.location.pathname === "/dashboard") return;
        console.log(rootElement);
        const tl = gsap.timeline();

        gsap.set("header", {
            marginTop: -100
        });

        window.addEventListener("mousemove", (evt: MouseEvent) => {
            const isCloseToTop = evt.clientY < 100;

            if (isCloseToTop) {
                tl.to("header", {
                    marginTop: 0,
                    duration: 0.5,
                    ease: "power1.inOut"
                });
            } else if (tl.progress() > 0) {
                tl.reverse();
            }
        });
    },
    render: async () => {
        const user = stateManager.getState("authUser");
        const isAuthenticated = await AuthService.isAuthenticated();

        if (!isAuthenticated) {
            return <header class="row shrink pad-sm"></header>;
        }

        return (
            <header class="row space-between pad bg-dark shadow-page">
                <div class="row start">
                    <div
                        class="animoji"
                        data-trigger="click"
                        data-event="menu"
                        data-effect="open"
                    >
                        <span class="material-icons menu-icon">rocket</span>
                        <Player />
                    </div>
                </div>
                <div class="row end gap">
                    {user?.picture ? (
                        <img
                            src={user.picture}
                            alt="avatar"
                            class="ring-purple"
                            data-trigger="click"
                            data-event="menu"
                            data-effect="submenu"
                        />
                    ) : (
                        <span class="material-icons">person</span>
                    )}
                    <Button variant="icon" icon="notifications" />
                </div>
            </header>
        );
    }
});
