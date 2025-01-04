import DynamicIsland from "./components/dynamic-island.js";

export const Router = () => {
    // Helper to convert URL path to route file path
    const pathToRoute = (path) => {
        // Remove leading and trailing slashes, default to 'home'
        const cleanPath = path.replace(/^\/+|\/+$/g, '') || 'home';
        // Convert path segments to proper route path
        return cleanPath.split('/').join('/');
    };

    // Store the current page island
    let currentPageIsland = null;

    // Lazy load a route module
    const loadRoute = async (routePath) => {
        try {
            // Dynamically import the route module
            const route = await import(`./routes/${routePath}.js`);
            if (!route || !route.default) {
                throw new Error(`Route ${routePath} does not export a default function`);
            }
            return route.default;
        } catch (error) {
            console.error(`Failed to load route: ${routePath}`, error);
            // Fall back to home route if loading fails
            try {
                const home = await import('./routes/home.js');
                return home.default;
            } catch (homeError) {
                console.error('Failed to load home route:', homeError);
                // Return a minimal route if even home fails
                return () => ({
                    classes: ["error-page"],
                    header: () => "Error loading route",
                    aside: () => "",
                    main: () => "Failed to load the requested page.",
                    article: () => "",
                    footer: () => ""
                });
            }
        }
    };

    // Navigate to a route
    const navigate = async (path = '') => {
        const routePath = pathToRoute(path);
        const routeModule = await loadRoute(routePath);
        const routeComponent = routeModule();

        if (!currentPageIsland) {
            // First load - initialize the page island
            currentPageIsland = DynamicIsland(routeComponent);
            return currentPageIsland.init();
        } else {
            // Update existing page island
            currentPageIsland.update(routeComponent);
            return currentPageIsland;
        }
    };

    // Initialize router
    const init = async () => {
        // Get initial route from current path
        const initialPath = window.location.pathname;
        return navigate(initialPath);
    };

    return {
        navigate,
        init
    };
};

export default Router;