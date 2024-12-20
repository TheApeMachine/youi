import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Button } from "../button/Button";
import { Avatar } from "../profile/Avatar";
import { Flex } from "../Flex";
import { eventBus } from "@/lib/event";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Lamp } from "../lamp/Lamp";

gsap.registerPlugin(Flip);

export const Header = Component({
    effect: () => {
        const handleRouteChange = () => {
            const isDashboard = window.location.pathname === "/dashboard";
            const headerAvatar = document.querySelector("header img");
            const profileCard = document.querySelector(".profile-card");

            if (!headerAvatar) return;

            if (isDashboard) {
                // Store initial state for FLIP animation
                const state = Flip.getState(headerAvatar);

                headerAvatar.classList.add("xl", "ring-double-purple");
                if (profileCard) {
                    gsap.set(profileCard, {
                        height: "+=128px"
                    });
                }
                gsap.set(headerAvatar, {
                    width: "128px",
                    height: "128px",
                    position: "absolute",
                    top: "32px",
                    left: "50%",
                    xPercent: -50,
                    zIndex: 99999
                });

                // Animate from original state
                Flip.from(state, {
                    duration: 0.6,
                    ease: "power2.inOut",
                    absolute: true
                });
            } else {
                const state = Flip.getState(headerAvatar);

                headerAvatar.classList.remove("xl", "ring-double-purple");
                gsap.set(headerAvatar, {
                    width: "24px",
                    height: "24px",
                    position: "relative",
                    top: "auto",
                    left: "auto",
                    xPercent: 0,
                    zIndex: 99999
                });

                if (profileCard) {
                    gsap.set(profileCard, {
                        height: "-=128px"
                    });
                }

                // Animate from original state
                Flip.from(state, {
                    duration: 0.6,
                    ease: "power2.inOut",
                    absolute: true
                });
            }
        };

        // Initial setup
        handleRouteChange();

        // Listen for navigation events
        eventBus.subscribe("navigate", handleRouteChange);
        eventBus.subscribe("request-avatar", (evt: any) => {
            const headerAvatar = document.querySelector("header img");

            headerAvatar?.classList.add("xl", "ring-double-purple");
            Flip.fit(headerAvatar, ".avatar-placeholder", {
                duration: 0.6,
                ease: "power2.inOut"
            });
        });

        // Cleanup
        eventBus.subscribe("cleanup", () => {
            eventBus.subscribe("navigate", handleRouteChange);
        });
    },
    render: () => {
        return (
            <header>
                <Flex
                    pad="md"
                    justify="space-between"
                    background="muted"
                    fullWidth
                >
                    <Flex grow={false}>
                        <Button
                            variant="animoji"
                            icon="rocket"
                            className="icon xl"
                            trigger="click"
                            event="dialog"
                            effect="open"
                        />
                    </Flex>
                    <Flex grow={false}>
                        <Avatar />
                        <Button variant="animoji" icon="notifications" />
                        <Lamp />
                    </Flex>
                </Flex>
            </header>
        );
    }
});
