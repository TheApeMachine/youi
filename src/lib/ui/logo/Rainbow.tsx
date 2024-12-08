import { jsx } from "@/lib/template";
import { SVG } from "@/lib/ui/svg/SVG";
import { Circle } from "@/lib/ui/svg/Circle";
import { Text } from "@/lib/ui/Text";

const RAINBOW_COLORS = [
    "#D8334A",
    "#AC92EC",
    "#F6BB42",
    "#2ECC71",
    "#EC87C0",
    "#E9573F",
    "#4FC1E9"
] as const;

export const Rainbow = () => {
    const element = (
        <div data-animation="rainbow" data-on-render class="animation-container">
            <SVG width={200} height={100}>
                {RAINBOW_COLORS.map((color, index) => (
                    <Circle
                        cx={100}
                        cy={100}
                        r={20 * (index + 1)}
                        stroke={color}
                        strokeWidth={10}
                        fill="transparent"
                        className="colored-circle"
                    />
                ))}
            </SVG>
            <Text id="inner-text" interactive />
        </div>
    );

    return element;
};
