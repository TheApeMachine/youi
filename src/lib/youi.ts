import { eventManager } from "@/lib/event";
import { routerManager } from "@/lib/router/manager";
import { stateManager } from "@/lib/state";
import { initializeDebugContext } from "@/lib/debug/context";
import { themeManager } from "@/lib/theme/manager";

export const YouI = {
    isReady: false,
    init: async () => {
        initializeDebugContext();

        try {
            await Promise.all([
                eventManager.init().catch(e => console.error('Event manager init error:', e)),
                stateManager.init().catch(e => console.error('State manager init error:', e)),
                routerManager.init().catch(e => console.error('Router init error:', e)),
                themeManager.init().catch(e => console.error('Theme manager init error:', e))
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