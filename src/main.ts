import { YouI } from '@/lib/youi';

console.log('Application starting...');

document.addEventListener("DOMContentLoaded", async () => {
    console.log('DOM content loaded');
    if (document.body) {
        console.log('Body found, initializing YouI');
        await YouI.init();
        console.log('YouI initialized');
    } else {
        console.error('No body element found');
    }
});
