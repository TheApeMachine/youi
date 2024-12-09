import { jsx } from "@/lib/template";
import { Header } from "./layout/Header";
import { Aside } from "./layout/Aside";
import { Main } from "./layout/Main";
import { Article } from "./layout/Article";
import { Footer } from "./layout/Footer";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { DynamicIslandVariant, DynamicIslandSection, VariantConfig } from "./dynamic-island/variants";

gsap.registerPlugin(Flip);

interface DynamicIslandProps {
    variant?: DynamicIslandVariant;
    id: string;
    header?: JSX.Element;
    aside?: JSX.Element;
    main?: JSX.Element;
    article?: JSX.Element;
    footer?: JSX.Element;
}

export const DynamicIsland = async ({ variant, id, header, aside, main, article, footer }: DynamicIslandProps) => {

    const update = async (element: Element, config: VariantConfig) => {
        const state = Flip.getState([
            element,
            element.querySelector('header'),
            element.querySelector('aside'),
            element.querySelector('main'),
            element.querySelector('article'),
            element.querySelector('footer')
        ].filter(Boolean));

        gsap.set(element, config.styles);

        const sections: DynamicIslandSection[] = ['header', 'aside', 'main', 'article', 'footer'];
        sections.forEach(selector => {
            const sectionConfig = config[selector];
            if (sectionConfig?.styles) {
                const child = element.querySelector(selector);
                if (child) {
                    gsap.set(child, sectionConfig.styles);
                }
            }
        });

        await Flip.from(state, {
            duration: 0.5,
            ease: "back.out(1.7)",
            nested: true
        });
    };

    const onMount = async (element: Element) => {
        // Apply initial variant styles with Flip
        if (variant) {
            const { variants } = await import(`./dynamic-island/variants`);
            const config = variants[variant];
            if (config) {
                await update(element, config);
            }
        }
    };

    return (
        <div className="dynamic-island" data-variant={variant} data-island={id} onMount={onMount}>
            <Header>
                {header}
            </Header>
            <Aside>
                {aside}
            </Aside>
            <Main>
                {main}
            </Main>
            <Article>
                {article}
            </Article>
            <Footer>
                {footer}
            </Footer>
        </div>
    );
};
