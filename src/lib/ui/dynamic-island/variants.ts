type StyleConfig = {
    styles: {
        [key: string]: string | number;
    };
};

export type DynamicIslandSection = 'header' | 'aside' | 'main' | 'article' | 'footer';

export type VariantConfig = {
    styles: StyleConfig['styles'];
} & Partial<Record<DynamicIslandSection, StyleConfig>>;

export const variants: Record<string, VariantConfig> = {
    logo: {
        styles: {
            display: "inline-grid",
            width: "auto",
            height: "auto"
        },
    },
    menu: {
        styles: {
            display: "inline-grid",
            width: "auto",
            height: "auto",
            borderRadius: "var(--xs)",
            boxShadow: "var(--shadow-card)",
        },
        header: {
            styles: {
                borderBottom: "1px solid var(--muted)",
            }
        }
    }
} as const;

export type DynamicIslandVariant = keyof typeof variants;
