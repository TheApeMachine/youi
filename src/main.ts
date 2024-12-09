import { YouI } from '@/lib/youi';

document.addEventListener("DOMContentLoaded", async () => {
    if (document.body) {
        await YouI.init();
    } else {
        console.error('No body element found');
    }
});
