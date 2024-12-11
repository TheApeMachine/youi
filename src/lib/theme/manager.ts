import { eventBus } from "../event";
import { EventPayload } from "../event/types";

// Private state
let currentTheme: string | null = null;
const themeLinks: Map<string, HTMLLinkElement> = new Map();

// Helper functions
const waitForStylesheet = async (link: HTMLLinkElement): Promise<void> => {
    return link.sheet ? Promise.resolve() : new Promise((resolve, reject) => {
        link.addEventListener('load', () => resolve());
        link.addEventListener('error', () => reject(new Error(`Error loading stylesheet: ${link.href}`)));
    });
};

const registerTheme = (name: string, path: string, isDefault: boolean) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = path;
    link.disabled = !isDefault;
    document.head.appendChild(link);
    themeLinks.set(name, link);
};

const initializeThemes = () => {
    registerTheme('base', '/src/assets/themes/base/styles.css', false);
    registerTheme('neumorphic', '/src/assets/themes/neumorphic/styles.css', false);
    registerTheme('glassmorphic', '/src/assets/themes/glassmorphic/styles.css', false);
    registerTheme('neobrutalism', '/src/assets/themes/neobrutalism/style.css', false);
    registerTheme('softui', '/src/assets/themes/softui/styles.css', false);
};

// Public functions
const loadTheme = async (themeName: string) => {
    if (themeName === currentTheme) return;

    const newLink = themeLinks.get(themeName);
    if (!newLink) {
        console.error(`Theme ${themeName} not found`);
        return;
    }

    try {
        themeLinks.forEach(link => link.disabled = true);
        newLink.disabled = false;
        await waitForStylesheet(newLink);
        currentTheme = themeName;
        localStorage.setItem('currentTheme', themeName);
    } catch (error) {
        console.error('Error switching themes:', error);
        if (currentTheme) {
            const currentLink = themeLinks.get(currentTheme);
            if (currentLink) currentLink.disabled = false;
        }
        newLink.disabled = true;
    }
};

const getCurrentTheme = () => currentTheme;
const getAvailableThemes = () => Array.from(themeLinks.keys());

const init = async (): Promise<void> => {
    initializeThemes();
    const storedTheme = localStorage.getItem('currentTheme');
    if (storedTheme && themeLinks.has(storedTheme)) {
        await loadTheme(storedTheme);
    } else {
        await loadTheme('base');
    }

    eventBus.subscribe("theme:change", (payload: EventPayload) => {
        loadTheme(payload.data);
    });
};

// Export public interface
export const themeManager = {
    loadTheme,
    getCurrentTheme,
    getAvailableThemes,
    init
};