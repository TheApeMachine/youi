import { YouI } from '@/lib/youi';

document.addEventListener("DOMContentLoaded", async () => {
    if (document.body) {
        await YouI.init();
    }
});
