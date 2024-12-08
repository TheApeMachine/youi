import { eventManager } from '@/lib/event';
import { EventPayload } from '@/lib/event/types';
import { jsx } from '@/lib/template';

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
            console.log('Router worker message:', type, payload);

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
        console.log('Updating view:', { slide, island, isNew });
        const slidesContainer = document.querySelector('.reveal .slides') as HTMLElement;
        if (!slidesContainer) {
            console.error('No slides container found');
            return;
        }

        let slideSection = document.querySelector(`section[data-slide="${slide}"]`) as HTMLElement;
        console.log('Found existing slide:', !!slideSection);

        if (!slideSection) {
            slideSection = document.createElement('section');
            slideSection.dataset.slide = slide;

            if (isNew) {
                try {
                    console.log('Loading route module:', slide);
                    const module = await import(`@/routes/${slide}.tsx`);
                    console.log('Route module loaded:', module);
                    const Component = module.default;
                    console.log('Component:', Component);
                    const element = await Component();
                    console.log('Component rendered:', element);
                    
                    if (element instanceof Node) {
                        slideSection.appendChild(element);
                    } else if (element && typeof element === 'object') {
                        // Handle JSX elements
                        console.log('Transforming JSX element');
                        const rendered = await jsx('div', null, element);
                        slideSection.appendChild(rendered);
                    } else {
                        console.error('Route component returned invalid element:', element);
                    }
                } catch (error) {
                    console.error(`Error loading slide ${slide}:`, error);
                    slideSection.innerHTML = `<div class="error">Slide not found: ${slide}</div>`;
                }
            }

            slidesContainer.appendChild(slideSection);
            console.log('Added slide section to container');
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
        console.log('Navigating to:', path);
        state.isNavigating = true;
        try {
            history.pushState(null, '', path);
            await sendWorkerMessage('navigate', { path });
        } finally {
            state.isNavigating = false;
        }
    };

    const init = async () => {
        console.log('Initializing router');
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
        console.log('Initial navigation to:', path);
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