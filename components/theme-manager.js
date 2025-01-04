import DynamicIsland from "./dynamic-island.js";
import Button from "./ui/button.js";
import Dropdown from "./ui/dropdown.js";

export const ThemeManager = () => {
    const STORAGE_KEY = 'youi-theme-preferences';
    const THEMES = [
        { value: 'base', label: 'Base Theme' },
        { value: 'neumorphic', label: 'Neumorphic' }
    ];

    // Get stored preferences or defaults
    const getStoredPreferences = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : { mode: 'light', theme: 'base' };
    };

    // Save preferences to localStorage
    const savePreferences = (prefs) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    };

    // Apply theme and mode to document
    const applyPreferences = (prefs) => {
        document.documentElement.dataset.mode = prefs.mode;
        document.documentElement.dataset.theme = prefs.theme;
        savePreferences(prefs);
    };

    // Create mode toggle island
    const createModeToggle = () => {
        const ModeToggle = () => {
            const classes = ["mode-toggle"];

            const main = () => {
                const prefs = getStoredPreferences();
                return prefs.mode === 'light' ? '🌙' : '☀️';
            };

            const handleClick = () => {
                const prefs = getStoredPreferences();
                prefs.mode = prefs.mode === 'light' ? 'dark' : 'light';
                applyPreferences(prefs);
                document.startViewTransition(() => {
                    const icon = main();
                    const mainElement = document.querySelector('.mode-toggle main');
                    if (mainElement) {
                        mainElement.textContent = icon;
                    }
                });
            };

            return {
                classes,
                header: () => "",
                aside: () => "",
                main,
                article: () => "",
                footer: () => "",
                onClick: handleClick
            };
        };

        const dynamicIsland = DynamicIsland(ModeToggle());
        return dynamicIsland.init();
    };

    // Create theme selector island
    const createThemeSelector = () => {
        const handleSelect = (selectedItem) => {
            const theme = THEMES.find(t => t.label === selectedItem);
            if (theme) {
                const prefs = getStoredPreferences();
                prefs.theme = theme.value;
                applyPreferences(prefs);
            }
        };

        const dynamicIsland = DynamicIsland(
            Dropdown(
                THEMES.map(theme => theme.label),
                handleSelect
            )
        );
        return dynamicIsland.init();
    };

    // Initialize with stored or default preferences
    const init = () => {
        const container = document.createElement('div');
        container.className = 'theme-controls';

        container.append(
            createModeToggle(),
            createThemeSelector()
        );

        const prefs = getStoredPreferences();
        applyPreferences(prefs);

        return container;
    };

    return { init };
};

export default ThemeManager; 