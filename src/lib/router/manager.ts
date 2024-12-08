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
            console.log('Router worker message received:', { type, payload, id });

            // Handle queued messages
            const queueIndex = state.messageQueue.findIndex(msg => msg.id === id);
            if (queueIndex !== -1) {
                console.log('Found queued message, resolving');
                const { resolve } = state.messageQueue[queueIndex];
                state.messageQueue.splice(queueIndex, 1);
                resolve(payload);

                // Don't return here if it's an updateView message
                if (type !== 'updateView') {
                    return;
                }
            }

            try {
                switch (type) {
                    case 'updateView':
                        console.log('Processing updateView message:', payload);
                        await updateView(payload);
                        break;
                    case 'islandUpdated':
                        console.log('Processing islandUpdated message:', payload);
                        await updateIsland(payload);
                        break;
                    case 'error':
                        console.error('Router worker error:', payload.error);
                        break;
                    default:
                        console.warn('Unknown message type:', type);
                }
            } catch (error) {
                console.error('Error processing message:', { type, error });
            }
        };
    };

    const updateView = async ({ slide, island, isNew }: { slide: string, island?: string, isNew: boolean }) => {
        console.log('updateView called with:', { slide, island, isNew });
        const slidesContainer = document.querySelector('.reveal .slides') as HTMLElement;
        if (!slidesContainer) {
            console.error('No slides container found');
            return;
        }
        console.log('Found slides container');

        let slideSection = document.querySelector(`section[data-slide="${slide}"]`) as HTMLElement;
        console.log('Existing slide section:', slideSection ? 'found' : 'not found');

        if (!slideSection || isNew) {
            console.log('Creating/updating slide section for:', slide);
            if (!slideSection) {
                slideSection = document.createElement('section');
                slideSection.dataset.slide = slide;
                slidesContainer.appendChild(slideSection);
                console.log('Created new slide section');
            }

            try {
                console.log(`Importing route module for: ${slide}`);
                const module = await import(`/src/routes/${slide}.tsx`);
                console.log('Route module loaded:', module);
                const Component = module.default;

                if (!Component) {
                    throw new Error(`No default export found in ${slide} module`);
                }

                console.log('Creating component instance');
                const element = Component();
                console.log('Component instance created:', element);

                if (element instanceof Node) {
                    console.log('Appending Node element');
                    slideSection.replaceChildren(element);
                } else if (element && typeof element === 'object') {
                    console.log('Transforming JSX element');
                    const rendered = await element;
                    console.log('JSX transformed:', rendered);
                    slideSection.replaceChildren(rendered);
                } else {
                    throw new Error(`Invalid element type: ${typeof element}`);
                }
            } catch (error) {
                console.error('Error in updateView:', error);
                slideSection.innerHTML = `<div class="error">Error loading ${slide}: ${error}</div>`;
            }

            state.reveal?.sync();
        }

        const slideIndex = Array.from(slidesContainer.children).indexOf(slideSection);
        console.log('Navigating to slide index:', slideIndex);
        state.reveal?.slide(slideIndex);

        if (island) {
            console.log('Updating island state:', island);
            await sendWorkerMessage('updateIsland', {
                slide,
                island,
                value: null
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
        console.log('Starting navigation to:', path);
        state.isNavigating = true;
        try {
            history.pushState(null, '', path);
            console.log('Sending navigation message to worker');
            await sendWorkerMessage('navigate', { path });
            console.log('Navigation complete');
        } catch (error) {
            console.error('Navigation failed:', error);
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

        console.log('Worker initialized, checking for slides container');
        const slidesContainer = document.querySelector('.reveal .slides');
        if (!slidesContainer) {
            console.error('Could not find slides container, creating it');
            const reveal = document.createElement('div');
            reveal.className = 'reveal';
            const slides = document.createElement('div');
            slides.className = 'slides';
            reveal.appendChild(slides);
            document.body.appendChild(reveal);
        } else {
            console.log('Found existing slides container');
        }

        // Initialize Reveal.js
        console.log('Checking Reveal.js initialization');
        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            state.reveal = (window as any).Reveal;
            if (state.reveal) {
                break;
            }
            console.log(`Reveal.js not found, retrying (${retries + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
        }

        if (!state.reveal) {
            console.error('Reveal.js not found after retries');
            throw new Error('Reveal.js not found');
        }

        if (!state.reveal.isReady()) {
            console.log('Initializing Reveal.js');
            await state.reveal.initialize({
                hash: false,
                autoSlide: 0,
                help: false,
                display: "flex",
                layout: false,
                ready: () => console.log('Reveal.js ready callback fired')
            });
            console.log('Reveal.js initialization complete');
        } else {
            console.log('Reveal.js already initialized');
        }

        // Setup event listeners
        console.log('Setting up navigation event listener');
        eventManager.subscribe('navigate', async (payload: EventPayload) => {
            if (!state.isNavigating && payload.data) {
                await navigate(payload.data);
            }
        });

        // Handle initial route
        const path = window.location.pathname;
        console.log('Triggering initial navigation to:', path);
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