import { eventManager } from "@/lib/event";
import { routerManager } from "./router/manager";
import { stateManager } from "./state";
import { initializeDebugContext } from "./debug/context";
import "@/assets/themes/styles.css";

export const YouI = {
    isReady: false,
    init: async () => {
        console.log('YouI initialization starting');

        // Initialize debug context first
        console.log('Initializing debug context');
        initializeDebugContext();

        // Initialize core systems in parallel
        console.log('Initializing core systems');
        try {
            await Promise.all([
                eventManager.init().catch(e => console.error('Event manager init error:', e)),
                stateManager.init().catch(e => console.error('State manager init error:', e)),
                routerManager.init().catch(e => console.error('Router init error:', e))
            ]);

            console.log('Core systems initialized');

            // Set ready flag and dispatch event
            YouI.isReady = true;
            document.dispatchEvent(new CustomEvent('youi:ready'));
        } catch (error) {
            console.error('Error during core systems initialization:', error);
        }
    }
};

// Expose YouI globally for debug purposes
(window as any).youi = YouI;