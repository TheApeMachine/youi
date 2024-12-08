declare namespace JSX {
    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

declare module "@/lib/template" {
    export const jsx: any;
    export const Fragment: any;
}

declare module "@/lib/ui/Component" {
    export const Component: any;
} 