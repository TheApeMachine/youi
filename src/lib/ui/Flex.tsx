import { jsx } from "@/lib/template";
import { Alignment, Background, Justification, Unit } from "./types";

interface FlexProps {
    children: JSX.Element;
    direction?: "row" | "column";
    align?: Alignment;
    justify?: Justification;
    background?: Background;
    gap?: boolean | Unit;
    grow?: boolean;
    pad?: boolean | Unit;
    radius?: boolean | Unit;
    scrollable?: boolean;
    text?: "left" | "center" | "right";
    fullHeight?: boolean;
    className?: string;
}

export const Flex = async ({
    children,
    direction = "column",
    align = "stretch",
    justify = "start",
    background = "transparent",
    gap = false,
    grow = false,
    pad = false,
    radius = false,
    fullHeight = false,
    scrollable = false,
    text = "left",
    className,
    ...props
}: FlexProps) => {
    const gapClass = typeof gap === "boolean" ? `gap-md` : `gap-${gap}`;
    const alignClass = align ? `align-${align}` : "";
    const justifyClass = justify ? `justify-${justify}` : "";
    const growClass = grow ? "flex-grow" : "";
    const padClass = typeof pad === "boolean" ? "pad-unit" : `pad-${pad}`;
    const backgroundClass = background ? `${background}` : "";
    const textClass = text ? `text-${text}` : "";
    const radiusClass =
        typeof radius === "boolean" ? "radius-xs" : `radius-${radius}`;
    const fullHeightClass = fullHeight ? "full-height" : "";
    const scrollableClass = scrollable ? "scrollable" : "";

    return (
        <div
            className={`flex ${direction} ${
                gap ? gapClass : ""
            } ${alignClass} ${justifyClass} ${growClass} ${
                pad ? padClass : ""
            } ${backgroundClass} ${radiusClass} ${textClass} ${className} ${fullHeightClass} ${scrollableClass}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const Row = async ({
    align = "stretch",
    justify = "start",
    gap = false,
    grow = false,
    pad = false,
    background = "transparent",
    text = "left",
    radius = false,
    children,
    className,
    ...props
}: {
    align?: Alignment;
    justify?: Justification;
    gap?: boolean | Unit;
    grow?: boolean;
    pad?: boolean | Unit;
    background?: Background;
    text?: "left" | "center" | "right";
    radius?: boolean | Unit;
    children: JSX.Element;
    className?: string;
}) => {
    return (
        <Flex
            direction="row"
            align={align}
            justify={justify}
            background={background}
            gap={gap}
            grow={grow}
            pad={pad}
            radius={radius}
            text={text}
            className={className}
            {...props}
        >
            {children}
        </Flex>
    );
};

export const Column = async ({
    align = "stretch",
    justify = "start",
    gap = false,
    pad = false,
    grow = false,
    background = "transparent",
    text = "left",
    radius = false,
    fullHeight = false,
    scrollable = false,
    children,
    className,
    ...props
}: {
    align?: Alignment;
    justify?: Justification;
    gap?: boolean | Unit;
    pad?: boolean | Unit;
    grow?: boolean;
    background?: Background;
    text?: "left" | "center" | "right";
    radius?: boolean | Unit;
    fullHeight?: boolean;
    scrollable?: boolean;
    children: JSX.Element;
    className?: string;
}) => {
    return (
        <Flex
            direction="column"
            align={align}
            justify={justify}
            gap={gap}
            pad={pad}
            grow={grow}
            background={background}
            radius={radius}
            fullHeight={fullHeight}
            text={text}
            scrollable={scrollable}
            className={className}
            {...props}
        >
            {children}
        </Flex>
    );
};

export const Center = async ({
    children,
    grow = false,
    pad = false,
    radius = false,
    text = "center",
    className,
    ...props
}: {
    children: JSX.Element;
    grow?: boolean;
    pad?: boolean | Unit;
    radius?: boolean | Unit;
    text?: "left" | "center" | "right";
    className?: string;
}) => {
    return (
        <Flex
            align="center"
            justify="center"
            grow={grow}
            pad={pad}
            radius={radius}
            text={text}
            className={className}
            {...props}
        >
            {children}
        </Flex>
    );
};
