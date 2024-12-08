import { jsx } from "@/lib/template";

interface DynamicIslandProps {
    children: JSX.Element;
}

export const DynamicIsland = ({ children }: DynamicIslandProps) => {
    const onMount = (element: Element) => {
        console.log("DynamicIsland mounted", element);
    };

    return (
        <div className="dynamic-island" onMount={onMount}>
            {children}
        </div>
    );
};
