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
            const { type, payload, id } = event.data;

            const queueIndex = state.messageQueue.findIndex(msg => msg.id === id);
            if (queueIndex !== -1) {
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
                        await updateView(payload);
                        break;
                    case 'islandUpdated':
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
        console.log("Updating view", slide, island, isNew);
        const slidesContainer = document.querySelector('.reveal .slides') as HTMLElement;
        if (!slidesContainer) {
            console.error('No slides container found');
            return;
        }

        let slideSection = document.querySelector(`section[data-slide="${slide}"]`) as HTMLElement;

        if (!slideSection || isNew) {
            if (!slideSection) {
                slideSection = document.createElement('section');
                slideSection.dataset.slide = slide;
                slidesContainer.appendChild(slideSection);
            }

            try {
                const module = await import(`/src/routes/${slide}.tsx`);
                const Component = module.default;

                if (!Component) {
                    throw new Error(`No default export found in ${slide} module`);
                }

                const element = Component();

                if (element instanceof Node) {
                    slideSection.replaceChildren(element);
                } else if (element && typeof element === 'object') {
                    const rendered = await element;
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
        state.reveal?.slide(slideIndex);

        if (island) {
            await sendWorkerMessage('updateIsland', {
                slide,
                island,
                value: null
            });
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

        console.log("Available sections:", Object.keys(sections).filter(k => sections[k as SectionKey]));

        const { variants } = await import('@/lib/ui/dynamic-island/variants');
        const config = module.variant ? variants[module.variant] : null;

        const island = document.querySelector(`[data-island="${islandId}"]`) as HTMLElement;
        if (!island) return;

        const states = []

        states.push(Flip.getState(island), {
            props: "all"
        });

        if (config) {
            gsap.set(island, config.styles);
        }

        // Create an array of update promises
        ["header", "aside", "main", "article", "footer"].forEach(async (section) => {
            const element = island.querySelector(section) as HTMLElement;
            if (!element) return;

            // Take a snapshot of the current state
            states.push(Flip.getState(element, {
                props: "all"
            }));

            const sectionElement = island.querySelector(section) as HTMLElement;
            if (!sectionElement) return;

            const sectionConfig = config?.[section as SectionKey];
            if (sectionConfig) {
                gsap.set(sectionElement, sectionConfig.styles);
            }
            const sectionContent = sections[section as SectionKey];
            if (sectionContent) {
                const newContent = await sectionContent();
                element.replaceChildren(newContent);
            } else if (element.children.length > 0) {
                element.replaceChildren();
            }

            states.push(Flip.getState(element));
        });

        states.forEach((flipState) => {
            Flip.from(flipState as ReturnType<typeof Flip.getState>, {
                duration: 0.6,
                ease: "power2.inOut",
                scale: true,
                absolute: true,
                onLeave: (el) => {
                    gsap.fromTo(el, {
                        opacity: 1,
                    }, {
                        opacity: 0,
                        duration: 0.6,
                        ease: "power2.inOut"
                    });
                },
                onEnter: (el) => {
                    gsap.fromTo(el, {
                        opacity: 0,
                    }, {
                        opacity: 1,
                        duration: 0.6,
                        ease: "power2.inOut"
                    });
                }
            });
        });
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
        console.log("Navigating to", path);
        state.isNavigating = true;
        try {
            // Check authentication for protected routes
            const isPublicRoute = publicRoutes.some(route => path.startsWith(route));
            const isAuthenticated = await AuthService.isAuthenticated();

            if (!isPublicRoute && !isAuthenticated) {
                // Redirect to login if trying to access protected route while not authenticated
                path = '/login';
            } else if (path === '/login' && isAuthenticated) {
                // Redirect to home if trying to access login while authenticated
                path = '/';
            }

            // Parse the path to handle dynamic islands
            const [_, islandId, islandRoute] = path.split('/').filter(Boolean);

            if (islandId && islandRoute) {
                // Handle dynamic island update
                await updateIsland({
                    islandId,
                    route: islandRoute
                });
            } else {
                // Regular slide navigation
                history.pushState(null, '', path);
                await sendWorkerMessage('navigate', { path });
            }
        } catch (error) {
            console.error('Error in navigate:', error);
            state.isNavigating = false;
        }
        state.isNavigating = false;
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

        const slidesContainer = document.querySelector('.reveal .slides');
        if (!slidesContainer) {
            console.error('Could not find slides container, creating it');
            const reveal = document.createElement('div');
            reveal.className = 'reveal';
            const slides = document.createElement('div');
            slides.className = 'slides';
            reveal.appendChild(slides);
            document.body.appendChild(reveal);
        }

        let retries = 0;
        const maxRetries = 3;

        while (retries < maxRetries) {
            state.reveal = (window as any).Reveal;
            if (state.reveal) {
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries++;
        }

        if (!state.reveal) {
            console.error('Reveal.js not found after retries');
            throw new Error('Reveal.js not found');
        }

        if (!state.reveal.isReady()) {
            await state.reveal.initialize({
                hash: false,
                autoSlide: 0,
                help: false,
                display: "flex",
                layout: false,
                ready: () => console.log('Reveal.js ready callback fired')
            });
        }

        // Setup event listeners
        eventManager.subscribe('navigate', async (payload: EventPayload) => {
            if (!state.isNavigating && payload.data) {
                await navigate(payload.data);
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