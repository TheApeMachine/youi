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

export const DynamicIsland = ({
    variant,
    header,
    aside,
    main,
    article,
    footer
}: DynamicIslandProps) => {
    return (
        <div className={`dynamic-island ${variant}`}>
            {header}
            {aside}
            {main}
            {article}
            {footer}
        </div>
    );
};
