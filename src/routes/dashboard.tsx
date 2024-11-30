import { Bars } from "@/lib/ui/charts/Bars";
import { Donut } from "@/lib/ui/charts/Donut";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { faker } from "@faker-js/faker";
import { Calendar } from "@/lib/ui/calendar/Calendar";
import { stateManager } from "@/lib/state";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

export const render = Component({
    effect: () => {
        // Get the header avatar
        const headerAvatar = document.querySelector("header img");
        const profileCard = document.querySelector(".profile-card");

        if (!headerAvatar) return;

        // Store initial state
        const state = Flip.getState(headerAvatar);

        // Add dashboard avatar classes
        headerAvatar.classList.add("xl", "ring-double-purple");
        gsap.set(profileCard, {
            height: "+=128px"
        });

        // Set new position and size
        gsap.set(headerAvatar, {
            width: "128px",
            height: "128px",
            position: "absolute",
            top: "32px", // Adjust based on your layout
            left: "50%",
            xPercent: -50,
            zIndex: 99999
        });

        // Animate from original state
        Flip.from(state, {
            duration: 0.6,
            ease: "power2.inOut",
            absolute: true,
            scale: true,
            spin: 0.5
        });
    },
    render: () => {
        const user = stateManager.getState("user");

        return (
            <div class="column width height gap pad">
                <div class="row start gap">
                    <div class="column height gap">
                        <div class="column width radius-xs bg-dark">
                            <nav class="column width">
                                <a
                                    href="/dashboard/settings"
                                    class="badge-button"
                                >
                                    <span class="material-symbols-rounded">
                                        mail
                                    </span>
                                    Messages
                                    <span class="badge">3</span>
                                </a>
                                <a
                                    href="/dashboard/profile"
                                    class="badge-button"
                                >
                                    <span class="material-symbols-rounded">
                                        send
                                    </span>
                                    Invitations
                                    <span class="badge">3</span>
                                </a>
                                <a
                                    href="/dashboard/logout"
                                    class="badge-button"
                                >
                                    <span class="material-symbols-rounded">
                                        calendar_month
                                    </span>
                                    Events
                                    <span class="badge">3</span>
                                </a>
                                <a
                                    href="/dashboard/logout"
                                    class="badge-button"
                                >
                                    <span class="material-symbols-rounded">
                                        settings
                                    </span>
                                    Account Settings
                                </a>
                                <a
                                    href="/dashboard/logout"
                                    class="badge-button"
                                >
                                    <span class="material-symbols-rounded">
                                        monitoring
                                    </span>
                                    Statistics
                                </a>
                            </nav>
                        </div>
                        <div class="column width center radius-xs bg-dark">
                            <Donut />
                        </div>
                    </div>
                    <div class="column height gap front">
                        <div class="column space-between width radius-xs bg-dark">
                            <div class="profile-card"></div>
                            <h3 class="lighter">{user.name}</h3>
                            <div class="row stretch width shrink self-end">
                                <a
                                    href="/dashboard/profile"
                                    class="accent-button yellow"
                                >
                                    <span class="material-icons">forum</span> 6
                                </a>
                                <a
                                    href="/dashboard/profile"
                                    class="accent-button green"
                                >
                                    <span class="material-icons">
                                        visibility
                                    </span>{" "}
                                    14
                                </a>
                                <a
                                    href="/dashboard/profile"
                                    class="accent-button red"
                                >
                                    <span class="material-icons">favorite</span>{" "}
                                    22
                                </a>
                            </div>
                        </div>
                        <div class="column width height radius-xs bg-dark">
                            <Bars />
                        </div>
                    </div>
                    <Calendar />
                </div>
            </div>
        );
    }
});
