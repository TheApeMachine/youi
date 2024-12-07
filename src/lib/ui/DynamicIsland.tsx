import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { gsap } from "gsap";
import Flip from "gsap/Flip";
import { Radius } from "./types";

gsap.registerPlugin(Flip);

interface DynamicIslandStyle {
    borderRadius?: Radius;
}

interface DynamicIslandProps {
    variant: string;
    style?: DynamicIslandStyle;
    header?: JSX.Element;
    aside?: JSX.Element;
    main?: JSX.Element;
    article?: JSX.Element;
    footer?: JSX.Element;
}

export const DynamicIsland = Component({
    effect: (context: DynamicIslandProps & { rootElement: HTMLElement }) => {
        if (context?.style) {
            requestAnimationFrame(() => {
                const elements = [context.rootElement];

                if (context.style) {
                    const state = Flip.getState(elements, {
                        props: Object.keys(context.style).join(",")
                    });

                    gsap.set(context.rootElement, context.style);

                    Flip.from(state, {
                        duration: 0.5,
                        ease: "back.out(1.7)"
                    });
                }
            });
        }
    },
    render: async (props: DynamicIslandProps) => {
        return (
            <div className={`dynamic-island ${props.variant}`}>
                <header>{props.header}</header>
                <aside>{props.aside}</aside>
                <main>{props.main}</main>
                <article>{props.article}</article>
                <footer>{props.footer}</footer>
            </div>
        );
    }
});
