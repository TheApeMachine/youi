import EventManager from "./events.js";
import Router from "./router.js";

export const YoUI = async () => {
    try {
        // Initialize event manager
        window.eventManager = EventManager();

        // Initialize router
        const router = Router();
        const pageIsland = await router.init();

        // Handle navigation events
        window.addEventListener('popstate', async () => {
            try {
                await router.navigate(window.location.pathname);
            } catch (error) {
                console.error('Navigation error:', error);
            }
        });

        // Mount the initial page island
        document.body.appendChild(pageIsland);

        return {
            router
        };
    } catch (error) {
        console.error('Failed to initialize YoUI:', error);
        throw error;
    }
};

// Initialize with stored preferences
const initializePreferences = () => {
    const storedMode = localStorage.getItem('youi-mode') || 'light';
    const storedTheme = localStorage.getItem('youi-theme') || 'base';
    document.documentElement.dataset.mode = storedMode;
    document.documentElement.dataset.theme = storedTheme;
};

initializePreferences();

export default YoUI;