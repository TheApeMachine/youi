import { jsx } from "@/lib/template";

interface SVGProps {
    width: number;
    height: number;
    children: JSX.Element | JSX.Element[];
    className?: string;
}

export const SVG = ({ width, height, children, className }: SVGProps) => (
    <svg
        width={width}
        height={height}
        class={className}
        xmlns="http://www.w3.org/2000/svg"
    >
        {children}
    </svg>
);
