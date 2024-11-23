import { Layout } from './ui/layout/Layout';
import { ErrorBoundary } from './ui/error/ErrorBoundary';

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
        const moduleName = path.replace(/.*\/(.*)\.ts[x]?$/, '$1');
        const module = await importFn() as RouteModule;
        if (module.render) {
            routes.push({
                path: moduleName === 'home' ? '/' : `/${moduleName}`,
                view: async (params) => module.render(params)
            });
        }
    }

    return routes;
}

let currentPath = '';

export const createRouter = async () => {
    const routes = await discoverRoutes();

    // Initialize the layout first
    const layout = await Layout({});
    document.body.replaceChildren(layout);

    // Find the slides container inside the layout
    const slidesContainer = document.querySelector('.reveal .slides') as HTMLElement;

    const router = async () => {
        const path = window.location.pathname;

        if (path !== currentPath) {
            currentPath = path;
            const { route, params } = matchRoute(path, routes);

            try {
                // Wait for the view to resolve
                const content = await route.view(params);

                // Create new slide section and append the resolved content
                const slideSection = document.createElement('section');
                if (content instanceof Node) {
                    slideSection.appendChild(content);
                } else {
                    slideSection.innerHTML = String(content);
                }

                // Add the new slide
                slidesContainer.appendChild(slideSection);

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
