import { Layout } from './ui/layout/Layout';
import { ErrorBoundary } from './ui/error/ErrorBoundary';
import { eventBus } from './event';

interface RouteModule {
    render: (params: Record<string, string>) => Promise<Node>;
}

export interface Route {
    path: string;
    view: (params: Record<string, string>) => Promise<Node>;
}

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
                    view: async (params) => module.render(params)
                });
            } else {
                routes.push({
                    path: moduleName === 'home' ? '/' : `/${moduleName}`,
                    view: async (params) => module.render(params)
                });
            }
        }
    }

    return routes;
}

let currentPath = '';

export const createRouter = async () => {
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
    if (reveal) {
        reveal.configure({
            hash: false,
            // Prevent auto-sliding
            autoSlide: 0,
            // Disable the help overlay
            help: false
        });
    }

    eventBus.subscribe('navigate', async (data: { url: string }) => {
        history.pushState(null, "", data.url);
        await router();
    });

    const router = async () => {
        const path = window.location.pathname;

        if (path !== currentPath) {
            currentPath = path;
            const { route, params } = matchRoute(path, routes);

            try {
                const reveal = (window as any).Reveal;
                const content = await route.view(params);

                // Create new slide section
                const slideSection = document.createElement('section');
                slideSection.dataset.path = path;
                if (content instanceof Node) {
                    slideSection.appendChild(content);
                } else {
                    slideSection.innerHTML = String(content);
                }

                // Find if we already have a slide with this path
                const existingSlide = slidesContainer.querySelector(`section[data-path="${path}"]`);
                if (existingSlide) {
                    // If slide exists, navigate to it
                    const slideIndex = Array.from(slidesContainer.children).indexOf(existingSlide);
                    if (reveal && reveal.isReady()) {
                        reveal.slide(slideIndex);
                    }
                } else {
                    // Add new slide and navigate to it
                    slidesContainer.appendChild(slideSection);
                    if (reveal && reveal.isReady()) {
                        reveal.sync();
                        reveal.slide(slidesContainer.children.length - 1);
                    }
                }

                // Optional: Clean up old slides
                const maxSlidesToKeep = 5;
                while (slidesContainer.children.length > maxSlidesToKeep) {
                    slidesContainer.removeChild(slidesContainer.firstChild!);
                }
            } catch (error: any) {
                console.error("Routing error:", error);
                const errorElement = await ErrorBoundary({ error: error });
                const errorSection = document.createElement('section');
                errorSection.appendChild(errorElement);
                slidesContainer.appendChild(errorSection);
            }
        }
    };

    // Initial route
    await router();

    window.addEventListener("popstate", () => {
        router();
    });

    return { router, navigateTo: createNavigateTo(router) };
};

const createNavigateTo = (router: () => Promise<void>) => {
    return async (url: string) => {
        if (url !== currentPath) {
            history.pushState(null, "", url);
            await router();
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
