import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "../event";
import { Header } from "./layout/Header";
import { Aside } from "./layout/Aside";
import { Article } from "./layout/Article";
import { Footer } from "./layout/Footer";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { EventPayload } from "../event";

gsap.registerPlugin(Flip);

type FlyoutVariant = "header" | "aside" | "article" | "footer";
type Direction = "left" | "right" | "top" | "bottom";

interface FlyoutProps {
    variant?: FlyoutVariant;
    direction?: Direction;
}

const lookupMap = {
    header: "height",
    aside: "width",
    article: "width",
    footer: "height"
};

export const Flyout = Component({
    effect: ({
        props,
        rootElement
    }: {
        props: FlyoutProps;
        rootElement: HTMLElement;
    }) => {
        if (window.location.pathname === "/dashboard") return;

        let isOpen = false;
        let isClosed = true;

        const mouseMoveHandler = (e: MouseEvent) => {
            if (e.originalEvent.clientY <= 50 && isClosed) {
                isOpen = true;
                isClosed = false;
            } else if (e.originalEvent.clientY > 50 && isOpen) {
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
                autoPlay: true,
                duration: 0.5,
                ease: "power2.out"
            });
        };

        eventBus.subscribe("mousemove", mouseMoveHandler);

        gsap.set(rootElement, {
            marginTop: -100
        });

        return () => {
            eventBus.unsubscribe("mousemove", mouseMoveHandler);
        };
    },
    render: async ({ variant = "header" }: FlyoutProps) => {
        return <Header />;
    }
});
