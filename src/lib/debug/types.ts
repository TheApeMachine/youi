export interface DebugEntry {
    id: string;
    timestamp: string;
    type: string;
    category: string;
    summary: string;
    details: any;
    stack?: string;
}

export interface DebugModuleContext {
    addLog: (entry: DebugEntry) => void;
    container: HTMLElement;
}

export interface DebugModuleInstance {
    component: HTMLElement;
    cleanup?: () => void;
}

export interface DebugModuleSetupOptions {
    addLog: (entry: DebugEntry) => void;
    container: HTMLElement;
    setupToolDragging: (element: HTMLElement) => void;
}

export interface DebugModuleSetup {
    name: string;
    description: string;
    setup: (options: DebugModuleSetupOptions) => Promise<DebugModuleInstance>;
} 