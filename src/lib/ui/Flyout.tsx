import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "../event";
import { Header } from "./layout/Header";
import { Aside } from "./layout/Aside";
import { Article } from "./layout/Article";
import { Footer } from "./layout/Footer";
import gsap from "gsap";
import { EventPayload } from "../event";

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
    effect: (props) => {
        if (!props?.variant || !props?.direction) return;

        const EDGE_THRESHOLD = 50;
        const tl = gsap.timeline({ paused: true });

        const edgeZoneMap = {
            header: () => 0,
            aside: () => 0,
            article: () => window.innerWidth,
            footer: () => window.innerHeight
        };

        const edgeZone = edgeZoneMap[props.variant]();

        const capitalizedDirection =
            props.direction.charAt(0).toUpperCase() + props.direction.slice(1);

        const expander = (rect: DOMRect) => {
            if (!tl.paused()) return; // Only reverse if the timeline is not paused
            tl.reverse();
        };

        const retractor = (rect: DOMRect) => {
            if (tl.paused()) return; // Only play if the timeline is paused
            tl.to(`.layout > ${props.variant}`, {
                [`margin${capitalizedDirection}`]:
                    -rect[lookupMap[props.variant] as keyof DOMRect] + 24,
                duration: 0.25,
                ease: "power2.inOut",
                onComplete: () => {
                    tl.pause();
                }
            });

            tl.play();
        };

        let lastRect: DOMRect | null = null;
        const debounce = (callback: Function, delay: number) => {
            let timeout: number;
            return (...args: any[]) => {
                clearTimeout(timeout);
                timeout = window.setTimeout(() => callback(...args), delay);
            };
        };

        const mouseMoveHandler = debounce((payload: EventPayload) => {
            const mouseEvent = payload.originalEvent as MouseEvent;
            const { clientX, clientY } = mouseEvent;

            if (!props.variant) return;

            const rectElement = document.querySelector(
                `.layout > ${props.variant}`
            );
            if (!rectElement) {
                console.error(
                    `Flyout: Could not find element for variant "${props.variant}"`
                );
                return;
            }

            lastRect = lastRect || rectElement.getBoundingClientRect();
            const rect = lastRect;

            const isAtEdge =
                (props.direction === "left" && clientX < EDGE_THRESHOLD) ||
                (props.direction === "right" &&
                    clientX > edgeZone - EDGE_THRESHOLD) ||
                (props.direction === "top" && clientY < EDGE_THRESHOLD) ||
                (props.direction === "bottom" &&
                    clientY > edgeZone - EDGE_THRESHOLD);

            isAtEdge ? expander(rect) : retractor(rect);
        }, 50);

        // Subscribe to mousemove event
        eventBus.subscribe("mousemove", mouseMoveHandler);

        // Cleanup subscription on unmount
        return () => {
            eventBus.unsubscribe("mousemove", mouseMoveHandler);
        };
    },
    render: async ({ variant = "header" }: FlyoutProps) => {
        switch (variant) {
            case "header":
                return <Header />;
            case "aside":
                return <Aside />;
            case "article":
                return <Article />;
            case "footer":
                return <Footer />;
            default:
                return null;
        }
    }
});
