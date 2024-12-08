import { jsx } from "@/lib/template";
import { Radius } from "./types";

interface DynamicIslandStyle {
    borderRadius?: Radius;
}

interface DynamicIslandProps {
    variant: string;
    style?: DynamicIslandStyle;
    header?: JSX.Element;
    aside?: JSX.Element;
    main?: JSX.Element;
    article?: JSX.Element;
    footer?: JSX.Element;
    effect?: (rootElement: HTMLElement) => void | (() => void);
}

export const DynamicIsland = (props: DynamicIslandProps) => {
    const {
        variant,
        header,
        aside,
        main,
        article,
        footer,
        effect
    } = props;

    const element = (
        <div className={`dynamic-island ${variant}`}>
            {header}
            {aside}
            {main}
            {article}
            {footer}
        </div>
    );

    if (effect) {
        queueMicrotask(() => {
            const rootElement = element instanceof DocumentFragment
                ? element.firstElementChild as HTMLElement
                : element as HTMLElement;

            if (rootElement) {
                effect(rootElement);
            }
        });
    }

    return element;
};
