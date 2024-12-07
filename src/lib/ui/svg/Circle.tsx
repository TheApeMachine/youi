import { jsx } from "@/lib/template";

interface CircleProps {
    cx: number;
    cy: number;
    r: number;
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
    className?: string;
}

export const Circle = ({
    cx,
    cy,
    r,
    stroke,
    strokeWidth,
    fill = "none",
    className
}: CircleProps) => (
    <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={stroke}
        stroke-width={strokeWidth}
        fill={fill}
        class={className}
    />
);
