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

export interface DebugModuleSetup {
    setup: (context: DebugModuleContext) => Promise<DebugModuleInstance>;
    name: string;
    description?: string;
} 