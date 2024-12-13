import { jsx } from "@/lib/vdom";
import { SVG } from "@/lib/ui/svg/SVG";
import { Circle } from "@/lib/ui/svg/Circle";
import { Animation } from "@/lib/ui/animation/Animation";
import "@/assets/logo.css";

export const RAINBOW_COLORS = [
    "#D8334A",
    "#AC92EC",
    "#F6BB42",
    "#2ECC71",
] as const;

export const Rainbow = () => (
    <Animation variant="logo">
        <SVG width={400} height={100}>
            {RAINBOW_COLORS.map((color, index) => (
                <Circle
                    cx={200}
                    cy={100}
                    r={20 * (index + 1)}
                    stroke={color}
                    strokeWidth={10}
                    fill="transparent"
                    className="colored-circle"
                />
            ))}
        </SVG>
        <div id="inner-text" />
    </Animation>
);
