import { eventManager } from "@/lib/event";
import { routerManager } from "./router/manager";
import { stateManager } from "./state";
import { initializeDebugContext } from "./debug/context";
import "@/assets/themes/styles.css";

export const YouI = {
    init: async () => {
        console.log('YouI initialization starting');

        // Initialize debug context first
        console.log('Initializing debug context');
        initializeDebugContext();

        // Initialize all core systems in parallel
        console.log('Initializing core systems');
        try {
            await Promise.all([
                routerManager.init().catch(e => console.error('Router init error:', e)),
                eventManager.init().catch(e => console.error('Event manager init error:', e)),
                stateManager.init().catch(e => console.error('State manager init error:', e))
            ]);
            console.log('Core systems initialized');
        } catch (error) {
            console.error('Error during core systems initialization:', error);
        }
    }
};