import { jsx, renderApp } from '@/lib/vdom';
import { eventManager } from '@/lib/event';
import { EventPayload } from '@/lib/event/types';
import { AuthService } from '@/lib/auth';
import gsap from 'gsap';

// Public routes that don't require authentication
const publicRoutes = ['/login', '/signup', '/forgot-password'];

interface RouterState {
    worker: Worker | null;
    reveal: any;
    isNavigating: boolean;
    messageQueue: Array<{ resolve: (value: any) => void; reject: (error: any) => void; id: string }>;
    messageId: number;
}

export const RouterManager = () => {
    const state: RouterState = {
        worker: null,
        reveal: null,
        isNavigating: false,
        messageQueue: [],
        messageId: 0
    };

    const setupWorkerHandlers = () => {
        if (!state.worker) return;

        state.worker.onmessage = async (event) => {
            console.log("Worker message received", event);
            const { type, payload, id } = event.data;

            try {
                // Handle the message first
                switch (type) {
                    case 'updateView':
                        console.log("[Router] Updating view", payload);
                        await updateView(payload);
                        break;
                    case 'ready':
                        console.log('[Router] Worker ready:', payload);
                        break;
                    case 'state':
                        console.log('[Router] State update:', payload);
                        break;
                    case 'error':
                        console.error('Router worker error:', payload.error);
                        break;
                    default:
                        console.warn('Unknown message type:', type);
                }

                // Then resolve any queued promises
                const queueIndex = state.messageQueue.findIndex(msg => msg.id === id);
                if (queueIndex !== -1) {
                    const { resolve } = state.messageQueue[queueIndex];
                    state.messageQueue.splice(queueIndex, 1);
                    resolve(payload);
                }
            } catch (error) {
                console.error('Error processing message:', { type, error });
            }
        };
    };

    const updateView = async ({ content, target, params }: { content: string, target: string, params?: any }) => {
        try {
            const module = await import(`/src/routes/${content}.tsx`);
            const Component = module.default;
            if (!Component) throw new Error(`No default export found in ${content} module`);

            const vnode = await Component({ params });
            const targetElement = document.querySelector(target) || document.body;

            const transition = document.startViewTransition(async () => {
                await renderApp(vnode, targetElement);
            });

            await transition.finished;
        } catch (error) {
            console.error('Error in updateView:', error);
            const targetElement = document.querySelector(target) || document.body;
            targetElement.innerHTML = `<div class="error">Error loading ${content}: ${error}</div>`;
        }
    };

    const sendWorkerMessage = async (type: string, payload: any): Promise<any> => {
        if (!state.worker) throw new Error('Worker not initialized');

        return new Promise((resolve, reject) => {
            const id = String(state.messageId++);
            state.messageQueue.push({ resolve, reject, id });
            state.worker!.postMessage({ type, payload, id });
        });
    };

    const waitForReady = async (maxAttempts = 5) => {
        return new Promise<boolean>((resolve) => {
            // If already ready, resolve immediately
            if ((window as any).youi?.isReady) {
                resolve(true);
                return;
            }

            // Listen for the ready event
            document.addEventListener('youi:ready', () => {
                resolve(true);
            }, { once: true });

            // Also set a timeout as fallback
            setTimeout(() => {
                resolve(false);
            }, maxAttempts * 1000);
        });
    };

    const navigate = async (path: string) => {
        console.log("[Router] Starting navigation to:", path);
        state.isNavigating = true;
        try {
            const isReady = await waitForReady();
            console.log("[Router] System ready status:", isReady);

            if (isReady) {
                const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
                const isAuthenticated = await AuthService.isAuthenticated();
                console.log("[Router] Auth status:", { isPublicRoute, isAuthenticated });

                if (!isPublicRoute && !isAuthenticated) {
                    path = '/login';
                } else if (path === '/login' && isAuthenticated) {
                    path = '/';
                }

                console.log("[Router] Sending navigate message to worker:", { path });

                const segments = path.split('/').filter(Boolean);
                const isIslandUpdate = segments.length > 1;

                const params = isIslandUpdate ? {
                    id: segments[segments.length - 2]
                } : undefined;

                if (!isIslandUpdate) {
                    history.pushState(null, '', path);
                }

                await sendWorkerMessage('navigate', { path, params });
            } else {
                console.warn("[Router] System not ready after maximum attempts");
            }
        } catch (error) {
            console.error('[Router] Error in navigate:', error);
        } finally {
            state.isNavigating = false;
        }
    };

    const init = async () => {
        // Initialize worker
        state.worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
        setupWorkerHandlers();

        // Wait for worker to be ready
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Worker initialization timeout')), 5000);
            const id = 'init';
            state.messageQueue.push({
                resolve: () => {
                    clearTimeout(timeout);
                    resolve();
                },
                reject,
                id
            });
            state.worker!.postMessage({ type: 'init', payload: {}, id });
        });

        // Setup event listeners
        eventManager.subscribe('navigate', async (payload: EventPayload) => {
            if (!state.isNavigating && payload.data) {
                await navigate(payload.data);
            }
        });

        // Listen for youi:ready event to handle initial navigation
        document.addEventListener('youi:ready', async () => {
            const path = window.location.pathname;
            await navigate(path);
        }, { once: true });
    };

    return {
        init,
        navigate,
        sendWorkerMessage
    };
};

// Export singleton instance
export const routerManager = RouterManager();