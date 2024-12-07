import localforage from 'localforage';
import { StateBackend } from './types';

export const createIndexedDBBackend = (): StateBackend => {
    // Initialize localforage
    localforage.config({
        name: 'youi',
        storeName: 'state'
    });

    return {
        get: async <T>(key: string) => {
            const response = await localforage.getItem(key);
            return response as T;
        },

        set: async (key: string, value: any) => {
            await localforage.setItem(key, value);
        },

        update: async (key: string, value: any) => {
            const existing = await localforage.getItem(key);
            await localforage.setItem(key, {
                ...(existing || {}),
                ...value
            });
        }
    };
}; 