import { jsx } from "@/lib/vdom";
import { Alignment, Background, Justification, Unit } from "./types";

/*
Example usage:

<Grid 
    columns={3} 
    gap="md" 
    align="center" 
    justify="space-between"
    pad="lg"
    background="surface"
>
    <GridItem span={2} area="header">Header Content</GridItem>
    <GridItem column="3" row="1">Side Content</GridItem>
    <GridItem area="main">Main Content</GridItem>
</Grid>

Example with areas:

<Grid 
    areas={[
        "header header header",
        "sidebar main main",
        "footer footer footer"
    ]}
    gap
>
    <GridItem area="header">Header</GridItem>
    <GridItem area="sidebar">Sidebar</GridItem>
    <GridItem area="main">Main Content</GridItem>
    <GridItem area="footer">Footer</GridItem>
</Grid>
*/

interface GridProps {
    children: JSX.Element;
    columns?: number | string;
    rows?: number | string;
    areas?: string[];
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

export const Grid = async ({
    children,
    columns = "1",
    rows = "auto",
    areas,
    gap = false,
    rowGap,
    columnGap,
    align = "stretch",
    justify = "start",
    background = "transparent",
    pad = false,
    radius = false,
    grow = false,
    className,
    ...props
}: GridProps) => {
    const gapClass = typeof gap === "boolean" ? "gap-unit" : `gap-${gap}`;
    const rowGapClass = rowGap ? `row-gap-${rowGap}` : "";
    const columnGapClass = columnGap ? `column-gap-${columnGap}` : "";
    const alignClass = align ? `align-${align}` : "";
    const justifyClass = justify ? `justify-${justify}` : "";
    const growClass = grow ? "grid-grow" : "";
    const padClass = typeof pad === "boolean" ? "pad-unit" : `pad-${pad}`;
    const backgroundClass = background ? `${background}` : "";
    const radiusClass =
        typeof radius === "boolean" ? "radius-xs" : `radius-${radius}`;

    const gridColumns =
        typeof columns === "number" ? `repeat(${columns}, 1fr)` : columns;
    const gridRows = typeof rows === "number" ? `repeat(${rows}, 1fr)` : rows;
    const gridAreas = areas ? areas.join(" ") : "";

    const style = {
        gridTemplateColumns: gridColumns,
        gridTemplateRows: gridRows,
        gridTemplateAreas: gridAreas || undefined
    };

    return (
        <div
            className={`grid ${gap ? gapClass : ""
                } ${rowGapClass} ${columnGapClass} ${alignClass} ${justifyClass} ${growClass} ${pad ? padClass : ""
                } ${backgroundClass} ${radiusClass} ${className ?? ""}`}
            style={style}
            {...props}
        >
            {children}
        </div>
    );
};

export const GridItem = async ({
    children,
    area,
    column,
    row,
    span,
    align = "stretch",
    justify = "start",
    pad = false,
    background = "transparent",
    radius = false,
    className,
    ...props
}: {
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
}) => {
    const style = [
        area ? `grid-area: ${area};` : "",
        column ? `grid-column: ${column};` : "",
        span ? `grid-column: span ${span};` : "",
        row ? `grid-row: ${row};` : ""
    ].join(" ");

    const alignClass = align ? `align-${align}` : "";
    const justifyClass = justify ? `justify-${justify}` : "";
    const padClass = typeof pad === "boolean" ? "pad-unit" : `pad-${pad}`;
    const backgroundClass = background ? `${background}` : "";
    const radiusClass =
        typeof radius === "boolean" ? "radius-xs" : `radius-${radius}`;

    return (
        <div
            className={`grid-item ${alignClass} ${justifyClass} ${pad ? padClass : ""
                } ${backgroundClass} ${radiusClass} ${className ?? ""}`}
            style={style}
            {...props}
        >
            {children}
        </div>
    );
};
