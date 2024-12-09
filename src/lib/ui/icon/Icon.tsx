import { jsx } from "@/lib/template";

interface IconProps {
    icon: string;
    color?: string;
}

export default ({ icon, color }: IconProps) => {
    const colorClass = color ? ` icon-${color}` : "";

    return (
        <span class={`material-symbols-rounded icon ${colorClass}`}>
            {icon}
        </span>
    );
};
