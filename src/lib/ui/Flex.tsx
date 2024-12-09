import { jsx } from "@/lib/template";
import { Alignment, Justification, Unit } from "./types";

export const Flex = async ({
    children,
    direction = "column",
    align = "stretch",
    justify = "start",
    gap = false,
    grow = false,
    pad = false,
    className,
    ...props
}: {
    children: JSX.Element;
    direction?: "row" | "column";
    align?: Alignment;
    justify?: Justification;
    gap?: boolean | Unit;
    grow?: boolean;
    pad?: boolean | Unit;
    className?: string;
}) => {
    // If gap is a boolean, it should become gap-unit
    const gapClass = typeof gap === "boolean" ? `gap-unit` : `gap-${gap}`;
    const alignClass = align ? `align-${align}` : "";
    const justifyClass = justify ? `justify-${justify}` : "";
    const growClass = grow ? "flex-grow" : "";
    const padClass = typeof pad === "boolean" ? "pad-unit" : `pad-${pad}`;

    return (
        <div
            className={`flex ${direction} ${gap ? gapClass : ""
                } ${alignClass} ${justifyClass} ${growClass} ${pad ? padClass : ""} ${className}`}
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
    children,
    className,
    ...props
}: {
    align?: Alignment;
    justify?: Justification;
    gap?: boolean | Unit;
    grow?: boolean;
    children: JSX.Element;
    className?: string;
}) => {
    return (
        <Flex
            direction="row"
            align={align}
            justify={justify}
            gap={gap}
            grow={grow}
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
    grow = false,
    children,
    className,
    ...props
}: {
    align?: Alignment;
    justify?: Justification;
    gap?: boolean | Unit;
    grow?: boolean;
    children: JSX.Element;
    className?: string;
}) => {
    return (
        <Flex
            direction="column"
            align={align}
            justify={justify}
            gap={gap}
            grow={grow}
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
    className,
    ...props
}: {
    children: JSX.Element;
    grow?: boolean;
    pad?: boolean | Unit;
    className?: string;
}) => {
    return (
        <Flex
            align="center"
            justify="center"
            grow={grow}
            pad={pad}
            className={className}
            {...props}
        >
            {children}
        </Flex>
    );
};
