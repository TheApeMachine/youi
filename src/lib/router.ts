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

    const router = async (targetElement: HTMLElement) => {
        const path = window.location.pathname;

        if (path !== currentPath) {
            const previousContent = targetElement.firstChild as HTMLElement;
            currentPath = path;

            const { route, params } = matchRoute(path, routes);

            try {
                if (previousContent) {
                    targetElement.removeChild(previousContent);
                }

                const content = await route.view(params);
                targetElement.appendChild(content);
            } catch (error: any) {
                console.error("Routing error:", error);
                const errorElement = document.createElement("error-boundary");
                errorElement.textContent = error.message;
                targetElement.innerHTML = '';
                targetElement.appendChild(errorElement);
            }
        }
    };

    window.addEventListener("popstate", () => {
        const target = document.querySelector("#app");
        if (target) {
            router(target as HTMLElement);
        }
    });

    return { router, navigateTo: createNavigateTo(router) };
};

const createNavigateTo = (router: (targetElement: HTMLElement) => Promise<void>) => {
    return async (url: string, targetElement: HTMLElement) => {
        if (url !== currentPath) {
            history.pushState(null, "", url);
            await router(targetElement);
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

    // Add fallback if no route matches and no 404 page exists
    const notFoundRoute = routes.find(route => route.path === "/404") ?? {
        path: "/404",
        view: async () => {
            // Import and use the 404 component directly
            const { render } = await import('@/routes/404');
            return render({});
        }
    };

    return { route: notFoundRoute, params: {} };
};
