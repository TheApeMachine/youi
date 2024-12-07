import { EventManager } from "@/lib/event";
import { createRouter } from "./router";

export const YouI = {
    init: async () => {
        const [{ router }] = await Promise.all([
            createRouter(),
            EventManager().init(),
        ]);
        await router();
    }
}