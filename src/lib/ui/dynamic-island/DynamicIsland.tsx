import { jsx } from "@/lib/vdom";
import { Header } from "../layout/Header";
import { Aside } from "../layout/Aside";
import { Main } from "../layout/Main";
import { Article } from "../layout/Article";
import { Footer } from "../layout/Footer";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { DynamicIslandVariant, DynamicIslandSection, VariantConfig } from "./variants";

gsap.registerPlugin(Flip);

interface DynamicIslandProps {
    id: string;
    variant?: DynamicIslandVariant;
    children?: JSX.Element[];
}

export const DynamicIsland = async ({ id, variant, children }: DynamicIslandProps) => {

    return (
        <div id={id} className="dynamic-island">
            {children}
        </div>
    );

};
