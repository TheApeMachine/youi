import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Button } from "../button/Button";
import { Avatar } from "../profile/Avatar";
import { Icon } from "../Icon";
import { Flex } from "../Flex";
import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

export const Header = Component({
    effect: () => {
        let state;
        let oldState;

        if (window.location.pathname === "/dashboard") {
            // Get the header avatar
            const headerAvatar = document.querySelector("header img");
            const profileCard = document.querySelector(".profile-card");

            if (!headerAvatar) return;

            state = Flip.getState(headerAvatar);
            oldState = state;

            // Add dashboard avatar classes
            headerAvatar.classList.add("xl", "ring-double-purple");
            gsap.set(profileCard, {
                height: "+=128px"
            });

            gsap.set("header", {
                marginTop: 0
            });

            // Set new position and size
            gsap.set(headerAvatar, {
                width: "128px",
                height: "128px",
                position: "absolute",
                top: "32px",
                left: "50%",
                xPercent: -50,
                zIndex: 99999
            });
        } else if (oldState) {
            const headerAvatar = document.querySelector("header img");
            state = Flip.getState(headerAvatar);
        }

        if (state) {
            // Animate from original state
            Flip.from(state, {
                duration: 0.6,
                ease: "power2.inOut",
                absolute: true
            });
        }
    },
    render: async () => {
        return (
            <header>
                <Flex pad="md" justify="space-between" fullWidth>
                    <Flex grow={false}>
                        <Button
                            variant="animoji"
                            icon="rocket"
                            className="icon xl"
                            data-trigger="click"
                            data-event="dialog"
                            data-effect="open"
                        />
                    </Flex>
                    <Flex grow={false}>
                        <Avatar />
                        <Button variant="animoji" icon="notifications" />
                    </Flex>
                </Flex>
                <Icon icon="arrow_drop_down" />
            </header>
        );
    }
});