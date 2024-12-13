import { jsx, renderApp } from '@/lib/vdom';
import { eventManager } from '@/lib/event';
import { EventPayload } from '@/lib/event/types';
import { AuthService } from '@/lib/auth';
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';

gsap.registerPlugin(Flip);

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
                        await updateView(payload);
                        break;
                    case 'islandUpdated':
                        await updateIsland(payload);
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

    const updateView = async ({ slide, island, isNew }: { slide: string, island?: string, isNew: boolean }) => {
        console.log("Updating view", slide, island, isNew);
        try {
            const module = await import(`/src/routes/${slide}.tsx`);
            const Component = module.default;

            console.log("Component", typeof Component);

            if (!Component) {
                throw new Error(`No default export found in ${slide} module`);
            }

            // Create a props object for the component
            const props = {
                id: slide, // Use slide as default id
                data: {
                    data: []
                } // Default data object
            };

            const vnode = await Component();
            renderApp(vnode, document.body);

        } catch (error) {
            console.error('Error in updateView:', error);
            document.body.innerHTML = `<div class="error">Error loading ${slide}: ${error}</div>`;
        }
    };

    const updateIsland = async ({ islandId, route }: { islandId: string, route: string }) => {
        console.log("Updating island", islandId, route);

        const module = await import(`/src/routes/islands/${route}.tsx`);
        type SectionKey = 'header' | 'aside' | 'main' | 'article' | 'footer';

        const sections: Record<SectionKey, (() => Promise<JSX.Element>) | null> = {
            header: module.Header || null,
            aside: module.Aside || null,
            main: module.Main || null,
            article: module.Article || null,
            footer: module.Footer || null
        };

        const { variants } = await import('@/lib/ui/dynamic-island/variants');
        const config = module.variant ? variants[module.variant] : null;

        const island = document.querySelector(`[data-island="${islandId}"]`) as HTMLElement;
        if (!island) return;


        const props = {
            id: islandId,
            variant: module.variant
        }

        const newChildren = jsx(Fragment, {},
            [
                jsx('header', {},
                    sections.header ? await sections.header() : null
                ),
                jsx('aside', {},
                    sections.aside ? await sections.aside() : null
                ),
                jsx('main', {},
                    sections.main ? await sections.main() : null
                ),
                jsx('article', {},
                    sections.article ? await sections.article() : null
                ),
                jsx('footer', {},
                    sections.footer ? await sections.footer() : null
                )
            ]
        );

        const element = jsx(
            'div',
            {
                ...props,
                style: config?.styles ? Object.fromEntries(
                    Object.entries(config.styles).map(([k, v]) => [k, String(v)])
                ) : undefined,
                transitionEnter: () => {
                    gsap.from(island, { opacity: 0, duration: 0.3 });
                },
                transitionExit: () => {
                    gsap.to(island, { opacity: 0, duration: 0.3 });
                }
            },
            newChildren
        );

        // Render the element via the virtual DOM
        jsx(
            element,
            island
        );
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
                // Only do auth checks if system is ready
                const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
                const isAuthenticated = await AuthService.isAuthenticated();
                console.log("[Router] Auth status:", { isPublicRoute, isAuthenticated });

                if (!isPublicRoute && !isAuthenticated) {
                    path = '/login';
                } else if (path === '/login' && isAuthenticated) {
                    path = '/';
                }

                // Parse the path to handle dynamic islands
                const [_, islandId, islandRoute] = path.split('/').filter(Boolean);

                if (islandId && islandRoute) {
                    console.log("[Router] Handling island navigation:", { islandId, islandRoute });
                    // Handle dynamic island update
                    await updateIsland({
                        islandId,
                        route: islandRoute
                    });
                } else {
                    console.log("[Router] Sending navigate message to worker:", { path });
                    // Regular slide navigation
                    history.pushState(null, '', path);
                    await sendWorkerMessage('navigate', { path });
                }
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