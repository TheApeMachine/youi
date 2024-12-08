import { loader } from '@/lib/loader';
import { StateBackend } from './types';

export const createHTTPBackend = (baseUrl: string = '/api'): StateBackend => {
    return {
        get: async <T>(key: string) => {
            const result = await loader({
                [key]: { url: `${baseUrl}/${key}` }
            });
            return result.state === 'success' ? result.results[key] as T : undefined;
        },

        set: async (key: string, value: any) => {
            await loader({
                [key]: {
                    url: `${baseUrl}/${key}`,
                    method: 'POST',
                    params: value
                }
            });
        },

        update: async (key: string, value: any) => {
            await loader({
                [key]: {
                    url: `${baseUrl}/${key}`,
                    method: 'PATCH',
                    params: value
                }
            });
        }
    };
}; 