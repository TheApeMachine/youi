import { eventManager } from "@/lib/event";
import { routerManager } from "./router/manager";
import { stateManager } from "./state";
import { initializeDebugContext } from "./debug/context";
import "@/assets/themes/styles.css";

export const YouI = {
    init: async () => {
        // Initialize debug context first
        initializeDebugContext();

        // Initialize all core systems in parallel
        await Promise.all([
            routerManager.init(),
            eventManager.init(),
            stateManager.init()
        ]);
    }
};