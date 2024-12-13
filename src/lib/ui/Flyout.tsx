import { jsx } from "@/lib/vdom";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "../event";
import { EventPayload } from "../event/types";
import { Header } from "./layout/Header";
import gsap from "gsap";
import { Flip } from "gsap/Flip";

gsap.registerPlugin(Flip);

type FlyoutVariant = "header" | "aside" | "article" | "footer";
type Direction = "left" | "right" | "top" | "bottom";

interface FlyoutProps {
    variant?: FlyoutVariant;
    direction?: Direction;
}

export const Flyout = Component({
    effect: ({
        rootElement
    }: {
        props: FlyoutProps;
        rootElement: HTMLElement;
    }) => {
        if (window.location.pathname === "/dashboard") return;

        let isOpen = false;
        let isClosed = true;

        const mouseMoveHandler = (e: EventPayload) => {
            const originalEvent = e.meta?.originalEvent as MouseEvent;

            if (originalEvent?.clientY <= 50 && isClosed) {
                isOpen = true;
                isClosed = false;
            } else if (originalEvent?.clientY > 50 && isOpen) {
                isOpen = false;
                isClosed = true;
            } else {
                return;
            }

            const state = Flip.getState(rootElement, {
                props: "marginTop"
            });
            gsap.set(rootElement, {
                marginTop: isOpen ? 0 : -100
            });

            gsap.set(rootElement.querySelector("icon"), {
                opacity: isOpen ? 1 : 0
            });

            Flip.from(state, {
                duration: 0.5,
                ease: "power2.out"
            });
        };

        if (window.location.pathname !== "/dashboard") {
            eventBus.subscribe("mousemove", mouseMoveHandler);
        }

        gsap.set(rootElement, {
            marginTop: -100
        });

        return () => {
            eventBus.unsubscribe("mousemove", mouseMoveHandler);
        };
    },
    render: async () => {
        return <Header />;
    }
});
