import { jsx } from "@/lib/vdom";
import { Alignment, Background, Justification, Unit } from "@/lib/ui/types";

interface FlexProps {
    children: JSX.Element;
    direction?: "row" | "column";
    align?: Alignment;
    justify?: Justification;
    background?: Background;
    gap?: boolean | Unit;
    grow?: boolean;
    pad?: boolean | Unit;
    fullHeight?: boolean;
    radius?: boolean | Unit;
    className?: string;
}

export const Flex = async ({
    children,
    direction = "column",
    align = "stretch",
    justify = "start",
    background,
    gap,
    grow,
    pad,
    fullHeight,
    radius,
    className = ""
}: FlexProps): Promise<JSX.Element> => {
    const classes = {
        flex: true,
        row: direction === 'row',
        column: direction === 'column',
        [`align-${align}`]: align,
        [`justify-${justify}`]: justify,
        [`gap-${gap === true ? 'md' : gap}`]: gap,
        [`pad-${pad === true ? 'md' : pad}`]: pad,
        [`radius-${radius === true ? 'md' : radius}`]: radius,
        [`height-${fullHeight ? 'full' : 'auto'}`]: fullHeight,
        [background as string]: background,
        grow: grow,
        [className]: className
    };

    return <div className={classes}>{children}</div>;
};

export const Row = async ({
    children,
    align,
    justify,
    gap,
    grow,
    pad,
    background,
    radius,
    fullHeight,
    className = ""
}: Omit<FlexProps, 'direction'>): Promise<JSX.Element> => {
    return (
        <Flex
            direction="row"
            align={align}
            justify={justify}
            gap={gap}
            grow={grow}
            pad={pad}
            background={background}
            radius={radius}
            fullHeight={fullHeight}
            className={className}
        >
            {children}
        </Flex>
    );
};

export const Column = async ({
    children,
    align,
    justify,
    gap,
    grow,
    pad,
    background,
    radius,
    fullHeight,
    className = ""
}: Omit<FlexProps, 'direction'>): Promise<JSX.Element> => {
    return (
        <Flex
            direction="column"
            align={align}
            justify={justify}
            gap={gap}
            grow={grow}
            pad={pad}
            background={background}
            radius={radius}
            fullHeight={fullHeight}
            className={className}
        >
            {children}
        </Flex>
    );
};

export const Center = async ({
    children,
    gap,
    grow,
    pad,
    background,
    radius,
    fullHeight,
    className = ""
}: Omit<FlexProps, 'direction' | 'align' | 'justify'>): Promise<JSX.Element> => {
    return (
        <Flex
            direction="column"
            align="center"
            justify="center"
            gap={gap}
            grow={grow}
            pad={pad}
            background={background}
            radius={radius}
            fullHeight={fullHeight}
            className={className}
        >
            {children}
        </Flex>
    );
};
