export * from './types';
import { createIndexedDBBackend } from './indexeddb';
import { createMongoBackend } from './mongo';
import { createHTTPBackend } from './http';
import { createCRDTBackend } from './crdt';
import { DataSource, StateBackend } from './types';

// Create and export backend instances
export const backends: Record<DataSource, StateBackend> = {
    indexeddb: createIndexedDBBackend(),
    mongo: createMongoBackend(),
    http: createHTTPBackend(),
    crdt: createCRDTBackend()
}; 