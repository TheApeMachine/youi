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
    className,
    ...props
}: FlexProps) => {
    const gapClass = typeof gap === "boolean" ? `gap-unit` : `gap-${gap}`;
    const alignClass = align ? `align-${align}` : "";
    const justifyClass = justify ? `justify-${justify}` : "";
    const growClass = grow ? "flex-grow" : "";
    const padClass = typeof pad === "boolean" ? "pad-unit" : `pad-${pad}`;
    const backgroundClass = background ? `${background}` : "";
    const radiusClass =
        typeof radius === "boolean" ? "radius-xs" : `radius-${radius}`;

    return (
        <div
            className={`flex ${direction} ${
                gap ? gapClass : ""
            } ${alignClass} ${justifyClass} ${growClass} ${
                pad ? padClass : ""
            } ${backgroundClass} ${radiusClass} ${className}`}
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
    radius = false,
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
    radius?: boolean | Unit;
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
    className,
    ...props
}: {
    children: JSX.Element;
    grow?: boolean;
    pad?: boolean | Unit;
    radius?: boolean | Unit;
    className?: string;
}) => {
    return (
        <Flex
            align="center"
            justify="center"
            grow={grow}
            pad={pad}
            radius={radius}
            className={className}
            {...props}
        >
            {children}
        </Flex>
    );
};
