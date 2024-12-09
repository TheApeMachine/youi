import { eventManager } from "@/lib/event";
import { routerManager } from "./router/manager";
import { stateManager } from "./state";
import { initializeDebugContext } from "./debug/context";
import "@/assets/themes/styles.css";

export const YouI = {
    isReady: false,
    init: async () => {
        initializeDebugContext();

        try {
            await Promise.all([
                eventManager.init().catch(e => console.error('Event manager init error:', e)),
                stateManager.init().catch(e => console.error('State manager init error:', e)),
                routerManager.init().catch(e => console.error('Router init error:', e))
            ]);

            YouI.isReady = true;
            document.dispatchEvent(new CustomEvent('youi:ready'));
        } catch (error) {
            console.error('Error during core systems initialization:', error);
        }
    }
};

// Expose YouI globally for debug purposes
(window as any).youi = YouI;