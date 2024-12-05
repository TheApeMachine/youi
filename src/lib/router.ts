import { Layout } from '@/lib/ui/layout/Layout';
import { ErrorBoundary } from '@/lib/ui/error/ErrorBoundary';
import { eventBus, EventPayload } from '@/lib/event';
import { AuthService } from '@/lib/auth';
import { stateManager } from '@/lib/state';

interface RouteModule {
    render: (params: Record<string, string>) => Promise<Node>;
}

export interface Route {
    path: string;
    view: (params: Record<string, string>) => Promise<Node>;
    public?: boolean;
}

// List of routes that don't require authentication
const publicPaths = ['/login', '/404', '/forgot-password'];

// Function to load and discover all route files dynamically
async function discoverRoutes(): Promise<Route[]> {
    const routeModules = import.meta.glob('@/routes/*.{ts,tsx}');
    const routes: Route[] = [];

    for (const [path, importFn] of Object.entries(routeModules)) {
        const moduleName = path.replace(/.*\/(.*?)\.tsx?$/, '$1');
        const module = await importFn() as RouteModule;
        if (module.render) {
            // Special handling for collection routes
            if (moduleName === 'collection') {
                routes.push({
                    path: '/collection/:id',
                    view: async (params) => module.render(params),
                    public: false
                });
            } else {
                routes.push({
                    path: moduleName === 'home' ? '/' : `/${moduleName}`,
                    view: async (params) => module.render(params),
                    public: publicPaths.includes(moduleName === 'home' ? '/' : `/${moduleName}`)
                });
            }
        }
    }

    return routes;
}

let currentPath = '';
let isNavigating = false;

export const createRouter = async () => {
    // Wait for state to be initialized first
    await stateManager.init();

    const routes = await discoverRoutes();
    const layout = await Layout({});

    // Only replace the body contents if it's empty or doesn't have our layout
    if (!document.body.querySelector('.reveal')) {
        document.body.replaceChildren(layout);
    }

    const slidesContainer = document.querySelector('.reveal .slides') as HTMLElement;
    if (!slidesContainer) {
        throw new Error('Could not find slides container');
    }

    // Initialize Reveal.js with hash: false to prevent default hash navigation
    const reveal = (window as any).Reveal;
    if (reveal && !reveal.isReady()) {
        await new Promise<void>((resolve) => {
            reveal.initialize({
                hash: false,
                autoSlide: 0,
                help: false,
                ready: () => resolve()
            });
        });
    }

    eventBus.subscribe('navigate', async (data: EventPayload) => {
        console.log('navigate', data);
        if (!isNavigating) {
            isNavigating = true;
            history.pushState(null, "", data.effect);
            await router();
            isNavigating = false;
        }
    });

    // Subscribe to auth state changes
    eventBus.subscribe('stateChange', async (data: { key: string, value: any }) => {
        if (data.key === 'auth') {
            await router();
        }
    });

    const router = async () => {
        const path = window.location.pathname;

        if (path !== currentPath || !document.querySelector(`section[data-path="${path}"]`)) {
            currentPath = path;
            const { route, params } = matchRoute(path, routes);

            // Check if the route requires authentication
            if (!route.public) {
                const isAuthenticated = await AuthService.isAuthenticated();
                if (!isAuthenticated) {
                    // Store the attempted URL to redirect back after login
                    sessionStorage.setItem('redirectUrl', path);
                    history.pushState(null, "", '/login');
                    currentPath = '/login';
                    const { route: loginRoute, params: loginParams } = matchRoute('/login', routes);
                    try {
                        const content = await loginRoute.view(loginParams);
                        await updateSlides(content, '/login');
                    } catch (error: any) {
                        handleRoutingError(error);
                    }
                    return;
                }
            }

            try {
                const content = await route.view(params);
                await updateSlides(content, path);
            } catch (error: any) {
                handleRoutingError(error);
            }
        }
    };

    const updateSlides = async (content: Node | string, path: string) => {
        await new Promise<void>((resolve) => {
            // Create new slide section
            const slideSection = document.createElement('section');
            slideSection.dataset.path = path;
            if (content instanceof Node) {
                slideSection.appendChild(content);
            } else {
                slideSection.innerHTML = String(content);
            }

            // Clear all existing slides first
            while (slidesContainer.firstChild) {
                slidesContainer.removeChild(slidesContainer.firstChild);
            }

            // Add the new slide
            slidesContainer.appendChild(slideSection);

            // Ensure Reveal.js is synced
            if (reveal?.isReady()) {
                reveal.sync();
                reveal.slide(0);
                // Wait for any transitions to complete
                setTimeout(resolve, 300);
            } else {
                resolve();
            }
        });
    };

    const handleRoutingError = async (error: Error) => {
        console.error("Routing error:", error);
        const errorElement = await ErrorBoundary({ error: error });
        const errorSection = document.createElement('section');
        errorSection.appendChild(errorElement);

        // Clear existing slides and show error
        while (slidesContainer.firstChild) {
            slidesContainer.removeChild(slidesContainer.firstChild);
        }
        slidesContainer.appendChild(errorSection);

        if (reveal?.isReady()) {
            reveal.sync();
            reveal.slide(0);
        }
    };

    // Initial route
    await router();

    window.addEventListener("popstate", () => {
        if (!isNavigating) {
            isNavigating = true;
            router().then(() => {
                isNavigating = false;
            });
        }
    });

    return { router, navigateTo: createNavigateTo(router) };
};

export const createNavigateTo = (router: () => Promise<void>) => {
    return async (url: string) => {
        if (url !== currentPath && !isNavigating) {
            isNavigating = true;
            history.pushState(null, "", url);
            await router();
            isNavigating = false;
        }
    };
};

// Function to match the current path against the available routes
const matchRoute = (path: string, routes: Route[]) => {
    for (const route of routes) {
        const paramNames: string[] = [];
        const regexPath = route.path
            .replace(/\/:([^/]+)/g, (_, paramName) => {
                paramNames.push(paramName);
                return '/([^/]+)';
            })
            .replace(/\//g, '\\/');

        const pathRegex = new RegExp(`^${regexPath}$`);
        const match = path.match(pathRegex);

        if (match) {
            const params: Record<string, string> = {};
            paramNames.forEach((name, index) => {
                params[name] = match[index + 1];
            });
            return { route, params };
        }
    }

    // Create a proper fallback route for 404
    const notFoundRoute: Route = routes.find(route => route.path === "/404") ?? {
        path: "/404",
        view: async () => ErrorBoundary({
            error: new Error(`Page not found: ${path}`)
        })
    };

    return { route: notFoundRoute, params: {} };
};