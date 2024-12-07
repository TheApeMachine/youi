import { StateBackend } from './types';
import { MongoClient } from '@/lib/mongo/client';
import { Query } from '@/lib/mongo/query';

export const createMongoBackend = (): StateBackend => {
    const client = MongoClient();

    return {
        get: async <T>(key: string) => {
            try {
                const query = Query.findOne({ key });
                const result = await client.execute(query);
                return result as T;
            } catch (error) {
                console.error(`MongoDB get error for ${key}:`, error);
                return undefined;
            }
        },

        set: async (key: string, value: any) => {
            try {
                const query = Query.insertOne({ key, value });
                await client.execute(query);
            } catch (error) {
                console.error(`MongoDB set error for ${key}:`, error);
                throw error;
            }
        },

        update: async (key: string, value: any) => {
            try {
                const query = Query.updateOne(
                    { key },
                    { $set: { value } }
                );
                await client.execute(query);
            } catch (error) {
                console.error(`MongoDB update error for ${key}:`, error);
                throw error;
            }
        }
    };
}; 