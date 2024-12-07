import { jsx } from '@/lib/template';

declare global {
    const jsx: typeof import('@/lib/template').jsx;
    namespace JSX {
        interface IntrinsicElements {
            [elemName: string]: any;
        }
    }
} 