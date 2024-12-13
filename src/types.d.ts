declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

declare module "@/lib/vdom" {
    export const jsx: any;
    export const Fragment: any;
    export const render: any;
    export const renderApp: any;
}
