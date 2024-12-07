export type DataSource = 'mongo' | 'indexeddb' | 'http' | 'crdt';

export interface StateBackend {
    get: <T>(key: string) => Promise<T | undefined>;
    set: (key: string, value: any) => Promise<void>;
    update: (key: string, value: any) => Promise<void>;
    subscribe?: (key: string, callback: (value: any) => void) => () => void;
}

export interface StateConfig {
    primary?: DataSource;
    sync?: DataSource[];
    cache?: boolean;
    realtime?: boolean;
} 