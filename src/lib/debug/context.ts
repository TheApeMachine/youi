import { createDebugOverlay } from "./debug";

export interface DebugContext {
    reportEvent: (category: string, event: any) => void;
    reportState: (component: string, state: any) => void;
    reportRender: (component: string, duration: number) => void;
    reportError: (component: string, error: Error) => void;
}

let debugContext: DebugContext | null = null;

export const initializeDebugContext = () => {
    const overlay = createDebugOverlay();

    debugContext = {
        reportEvent: (category, event) => {
            overlay.addLog({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: 'event',
                category,
                summary: `Event: ${event.type}`,
                details: event
            });
        },
        reportState: (component, state) => {
            overlay.addLog({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: 'state',
                category: component,
                summary: 'State Update',
                details: state
            });
        },
        reportRender: (component, duration) => {
            overlay.addLog({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: 'performance',
                category: component,
                summary: `Render: ${duration.toFixed(2)}ms`,
                details: { duration }
            });
        },
        reportError: (component, error) => {
            overlay.addLog({
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                type: 'error',
                category: component,
                summary: error.message,
                details: error,
                stack: error.stack
            });
        }
    };

    return debugContext;
};

export const getDebugContext = (): DebugContext | null => debugContext; 