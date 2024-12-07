import { P2P } from '@/lib/ui/chat/p2p';
import { StateBackend } from './types';

export const createCRDTBackend = (): StateBackend => {
    let p2pInstance: ReturnType<typeof P2P>;

    const getP2P = () => {
        if (!p2pInstance) {
            p2pInstance = P2P();
        }
        return p2pInstance;
    };

    return {
        get: async <T>(key: string) => {
            const p2p = getP2P();
            const ymap = p2p.ydoc.getMap(key);
            return ymap.toJSON() as T;
        },

        set: async (key: string, value: any) => {
            const p2p = getP2P();
            const ymap = p2p.ydoc.getMap(key);
            ymap.clear();
            Object.entries(value).forEach(([k, v]) => ymap.set(k, v));
        },

        update: async (key: string, value: any) => {
            const p2p = getP2P();
            const ymap = p2p.ydoc.getMap(key);
            Object.entries(value).forEach(([k, v]) => ymap.set(k, v));
        },

        subscribe: (key: string, callback: (value: any) => void) => {
            const p2p = getP2P();
            const ymap = p2p.ydoc.getMap(key);
            const observer = () => callback(ymap.toJSON());
            ymap.observe(observer);
            return () => ymap.unobserve(observer);
        }
    };
}; 