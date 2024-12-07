import { getDebugContext } from "./debug/context";

export interface ComponentProps {
    children?: any;
    [key: string]: any;
}

export interface ComponentConfig<P extends ComponentProps = ComponentProps> {
    effect?: () => void | (() => void);
    render: (props: P) => HTMLElement | null;
    name?: string;  // Added for debugging
}

export const Component = <P extends ComponentProps>(config: ComponentConfig<P>) => {
    return (props: P) => {
        const debug = getDebugContext();
        const componentName = config.name || 'AnonymousComponent';
        const startTime = performance.now();

        try {
            // Report component render start
            debug?.reportEvent(componentName, { type: 'render-start' });

            // Run effect if provided
            if (config.effect) {
                const cleanup = config.effect();
                if (cleanup) {
                    // Report effect cleanup registration
                    debug?.reportEvent(componentName, {
                        type: 'effect-cleanup-registered',
                        cleanup
                    });
                }
            }

            // Render component
            const result = config.render(props);

            // Report render completion and duration
            const duration = performance.now() - startTime;
            debug?.reportRender(componentName, duration);

            return result;
        } catch (error) {
            // Report any errors during rendering
            debug?.reportError(componentName, error as Error);
            throw error;
        }
    };
}; 