import { jsx } from "@/lib/template";
import { Alignment, Background, Justification, Unit } from "@/lib/ui/types";

interface GridProps {
    children: JSX.Element;
    columns?: number | string;
    rows?: number | string;
    areas?: "main" | string[];
    gap?: boolean | Unit;
    rowGap?: Unit;
    columnGap?: Unit;
    align?: Alignment;
    justify?: Justification;
    background?: Background;
    pad?: boolean | Unit;
    radius?: boolean | Unit;
    className?: string;
    grow?: boolean;
}

interface GridItemProps {
    children: JSX.Element;
    area?: string;
    column?: string;
    row?: string;
    span?: number;
    align?: Alignment;
    justify?: Justification;
    pad?: boolean | Unit;
    background?: Background;
    radius?: boolean | Unit;
    className?: string;
    order?: { sm?: number; md?: number; lg?: number };
    direction?: 'row' | 'column';
}

export const Grid = async ({
    children,
    columns = "1",
    rows = "auto",
    areas,
    gap,
    rowGap,
    columnGap,
    align,
    justify,
    background,
    pad,
    radius,
    grow,
    className = ""
}: GridProps) => {
    const classes = {
        grid: true,
        [`grid-cols-${columns}`]: typeof columns === 'number',
        [`grid-rows-${rows}`]: typeof rows === 'number',
        'grid-rows-auto': rows === 'auto',
        'grid-areas-main': areas === 'main',
        [`gap-${gap === true ? 'md' : gap}`]: gap,
        [`row-gap-${rowGap}`]: rowGap,
        [`column-gap-${columnGap}`]: columnGap,
        [`align-${align}`]: align,
        [`justify-${justify}`]: justify,
        [background as string]: background,
        [`pad-${pad === true ? 'md' : pad}`]: pad,
        [`radius-${radius === true ? 'md' : radius}`]: radius,
        grow: grow,
        [className]: className
    };

    const style = areas && areas !== 'main' ? {
        gridTemplateAreas: `"${areas.join('" "')}"`,
        gridTemplateColumns: typeof columns === 'string' && columns !== '1' ? columns : undefined,
        gridTemplateRows: typeof rows === 'string' && rows !== 'auto' ? rows : undefined
    } : undefined;

    return <div className={classes} style={style}>{children}</div>;
};

export const GridItem = async ({
    children,
    area,
    column,
    row,
    span,
    align,
    justify,
    pad,
    background,
    radius,
    order,
    direction,
    className = ""
}: GridItemProps) => {
    const classes = {
        'grid-item': true,
        'row': direction === 'row',
        'column': direction === 'column',
        [`grid-area-${area}`]: area,
        [`order-sm-${order?.sm}`]: order?.sm,
        [`order-md-${order?.md}`]: order?.md,
        [`order-lg-${order?.lg}`]: order?.lg,
        [`align-${align}`]: align,
        [`justify-${justify}`]: justify,
        [`pad-${pad === true ? 'md' : pad}`]: pad,
        [background as string]: background,
        [`radius-${radius === true ? 'md' : radius}`]: radius,
        [className]: className
    };

    const style = {
        gridColumn: span ? `span ${span}` : column,
        gridRow: row
    };

    return <div className={classes} style={style}>{children}</div>;
};