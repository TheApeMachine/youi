import { StateBackend } from './types';
import { fetchCollection, updateCollection } from '@/lib/mongo/client';

export const createMongoBackend = (): StateBackend => {
    return {
        get: async <T>(key: string) => {
            try {
                const result = await fetchCollection("State", {
                    query: { key }
                });
                return result[0] as T;
            } catch (error) {
                console.error(`MongoDB get error for ${key}:`, error);
                return undefined;
            }
        },

        set: async (key: string, value: any) => {
            try {
                await updateCollection("State", {
                    query: { key },
                    update: { $set: { key, value } },
                    upsert: true
                });
            } catch (error) {
                console.error(`MongoDB set error for ${key}:`, error);
                throw error;
            }
        },

        update: async (key: string, value: any) => {
            try {
                await updateCollection("State", {
                    query: { key },
                    update: { $set: { value } }
                });
            } catch (error) {
                console.error(`MongoDB update error for ${key}:`, error);
                throw error;
            }
        }
    };
}; 