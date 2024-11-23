import "@/assets/styles.css";
import { createRouter } from '@/lib/router';
import { EventManager } from "@/lib/event";

document.addEventListener("DOMContentLoaded", async () => {
    if (document.body) {
        const { router } = await createRouter();
        await router();
        EventManager().init();
    }
});