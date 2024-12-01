export interface ComponentConfig<P = any> {
    render: (props: P) => Promise<HTMLElement>;
    effect?: (props: { rootElement: HTMLElement }) => void;
}

export interface ComponentInstance<P = any> {
    (props: P): any;
    render: (props: P) => Promise<HTMLElement>;
    effect?: (props: { rootElement: HTMLElement }) => void;
}

export const Component: <P>(config: ComponentConfig<P>) => ComponentInstance<P>; 