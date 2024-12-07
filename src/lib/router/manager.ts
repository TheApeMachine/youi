import { eventManager } from '@/lib/event';
import { EventPayload } from '@/lib/event/types';
import { Layout } from '@/lib/ui/layout/Layout';

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
            const { type, payload, id } = event.data;

            // Handle queued messages
            const queueIndex = state.messageQueue.findIndex(msg => msg.id === id);
            if (queueIndex !== -1) {
                const { resolve } = state.messageQueue[queueIndex];
                state.messageQueue.splice(queueIndex, 1);
                resolve(payload);
                return;
            }

            switch (type) {
                case 'updateView':
                    await updateView(payload);
                    break;
                case 'islandUpdated':
                    await updateIsland(payload);
                    break;
                case 'error':
                    console.error('Router worker error:', payload.error);
                    break;
            }
        };
    };

    const updateView = async ({ slide, island, isNew }: { slide: string, island?: string, isNew: boolean }) => {
        const slidesContainer = document.querySelector('.reveal .slides') as HTMLElement;
        if (!slidesContainer) return;

        let slideSection = document.querySelector(`section[data-slide="${slide}"]`) as HTMLElement;

        if (!slideSection) {
            slideSection = document.createElement('section');
            slideSection.dataset.slide = slide;

            if (isNew) {
                try {
                    const module = await import(`@/routes/${slide}.tsx`);
                    const content = await module.render();
                    slideSection.appendChild(content);
                } catch (error) {
                    console.error(`Error loading slide ${slide}:`, error);
                    slideSection.innerHTML = `<div class="error">Slide not found: ${slide}</div>`;
                }
            }

            slidesContainer.appendChild(slideSection);
            state.reveal?.sync();
        }

        const slideIndex = Array.from(slidesContainer.children).indexOf(slideSection);
        state.reveal?.slide(slideIndex);

        if (island) {
            await sendWorkerMessage('updateIsland', {
                slide,
                island,
                value: null // Initial value
            });
        }
    };

    const updateIsland = async ({ slide, island, data }: { slide: string, island: string, data: any }) => {
        const slideElement = document.querySelector(`section[data-slide="${slide}"]`);
        if (!slideElement) return;

        const islandElement = slideElement.querySelector(`[data-island="${island}"]`);
        if (!islandElement) return;

        if (typeof data === 'function') {
            const content = await data();
            islandElement.replaceChildren(content);
        } else if (data instanceof Node) {
            islandElement.replaceChildren(data);
        } else {
            islandElement.textContent = String(data);
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

    const navigate = async (path: string) => {
        state.isNavigating = true;
        try {
            history.pushState(null, '', path);
            await sendWorkerMessage('navigate', { path });
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

        // Initialize Reveal.js
        const layout = await Layout({});
        if (!document.body.querySelector('.reveal')) {
            document.body.replaceChildren(layout);
        }

        const slidesContainer = document.querySelector('.reveal .slides');
        if (!slidesContainer) throw new Error('Could not find slides container');

        // Initialize Reveal.js
        state.reveal = (window as any).Reveal;
        if (state.reveal && !state.reveal.isReady()) {
            await new Promise<void>((resolve) => {
                state.reveal.initialize({
                    hash: false,
                    autoSlide: 0,
                    help: false,
                    ready: () => resolve()
                });
            });
        }

        // Setup event listeners
        eventManager.subscribe('navigate', async (payload: EventPayload) => {
            if (!state.isNavigating && payload.effect) {
                await navigate(payload.effect);
            }
        });

        // Handle initial route
        const path = window.location.pathname;
        await navigate(path);
    };

    return {
        init,
        navigate,
        sendWorkerMessage
    };
};

// Export singleton instance
export const routerManager = RouterManager(); 