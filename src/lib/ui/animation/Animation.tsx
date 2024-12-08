import { jsx } from "@/lib/template";
import { ANIMATIONS, AnimationVariant } from "./registry";

interface AnimationProps {
    variant: AnimationVariant;
    onRender?: () => void;
    children: JSX.Element;
}

export const Animation = ({ variant, onRender, children }: AnimationProps) => {
    console.log("Animation component rendering", { variant, children });

    const onMount = (element: Element) => {
        console.log("Animation mounted", { variant, element });
        const animate = ANIMATIONS[variant];
        const animationFn = animate();
        animationFn();
        onRender?.();
    };

    return (
        <div className="animation-wrapper" onMount={onMount}>
            {children}
        </div>
    );
};
