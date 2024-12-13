import { jsx } from "@/lib/vdom";

interface AnimationProps {
    variant: string;
    onRender?: boolean;
    children: JSX.Element | JSX.Element[];
}

export const Animation = ({ variant, onRender, children }: AnimationProps) => (
    <div
        data-animation={variant}
        data-on-render={onRender}
        class="animation-container"
    >
        {children}
    </div>
);
