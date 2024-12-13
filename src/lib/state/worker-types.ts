export interface StateData {
    value: any;
    timestamp: number;
    version: number;
}

export interface StateMessage {
    type: 'read' | 'write' | 'update' | 'notify' | 'remove' | 'ready';
    payload: any;
    id?: string;
}
