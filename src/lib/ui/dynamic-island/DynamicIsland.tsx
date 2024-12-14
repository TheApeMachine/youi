import { jsx } from "@/lib/vdom";
import { DynamicIslandVariant } from "./variants";

interface DynamicIslandProps {
    id: string;
    variant?: DynamicIslandVariant;
    children?: JSX.Element[];
}

export const DynamicIsland = async ({
    id,
    variant = "logo",
    children = []
}: DynamicIslandProps) => {
    return (
        <div id={id} data-island={id} className={`dynamic-island ${variant}`}>
            {children}
        </div>
    );
};
