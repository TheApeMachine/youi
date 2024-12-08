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

        // Initialize core systems sequentially
        console.log('Initializing core systems');
        try {
            console.log('Initializing event manager');
            await eventManager.init().catch(e => console.error('Event manager init error:', e));

            console.log('Initializing state manager');
            await stateManager.init().catch(e => console.error('State manager init error:', e));

            console.log('Initializing router');
            await routerManager.init().catch(e => console.error('Router init error:', e));

            console.log('Core systems initialized');
        } catch (error) {
            console.error('Error during core systems initialization:', error);
        }
    }
};