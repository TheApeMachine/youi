import "@/assets/styles.css";
import { createRouter } from '@/lib/router';
import { stateManager } from "@/lib/state";
import { EventManager } from "@/lib/event";

document.addEventListener("DOMContentLoaded", async () => {
    if (document.body) {
        const { router } = await createRouter();
        await router();
        await EventManager().init();
        await stateManager.init();
    }
});