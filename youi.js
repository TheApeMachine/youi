import DynamicIsland from "./components/dynamic-island.js";
import Button from "./components/ui/button.js";
import Dropdown from "./components/ui/dropdown.js";
import Notification from "./components/ui/notification.js";
import Progress from "./components/ui/progress.js";
import QuickActions from "./components/ui/quick-actions.js";
import NavItem from "./components/ui/nav-item.js";
import TokenControls, { defaultTokenGroups } from "./components/ui/token-controls.js";

export const YoUI = () => {
    // Available states for the Dynamic Island
    const states = [
        {
            id: 'button',
            label: 'Button',
            description: 'A simple button that morphs on interaction',
            component: Button
        },
        {
            id: 'dropdown',
            label: 'Dropdown Menu',
            description: 'Expands to reveal a list of options',
            component: () => Dropdown(['Profile', 'Settings', 'Help', 'Logout'])
        },
        {
            id: 'notification',
            label: 'Notification',
            description: 'Displays important updates and messages',
            component: () => Notification('New message from Alice', '💌')
        },
        {
            id: 'progress',
            label: 'Progress Indicator',
            description: 'Shows the progress of an ongoing operation',
            component: () => Progress(75, 'Downloading updates...')
        },
        {
            id: 'quick-actions',
            label: 'Quick Actions',
            description: 'Provides quick access to common actions',
            component: () => QuickActions([
                { icon: '🔍', label: 'Search' },
                { icon: '⚡', label: 'Actions' },
                { icon: '⚙️', label: 'Settings' },
                { icon: '👤', label: 'Profile' }
            ])
        }
    ];

    // Theme controls
    const ModeToggle = () => {
        const classes = ["mode-toggle"];

        const main = () => {
            return document.documentElement.dataset.mode === 'light' ? '🌙' : '☀️';
        };

        const onClick = () => {
            document.startViewTransition(() => {
                const currentMode = document.documentElement.dataset.mode;
                const newMode = currentMode === 'light' ? 'dark' : 'light';
                document.documentElement.dataset.mode = newMode;
                localStorage.setItem('youi-mode', newMode);

                // Update the icon
                const modeIcon = document.querySelector('.mode-toggle main');
                if (modeIcon) {
                    modeIcon.textContent = newMode === 'light' ? '🌙' : '☀️';
                }
            });
        };

        return { classes, header: () => "", aside: () => "", main, article: () => "", footer: () => "", onClick };
    };

    const ThemeSelector = () => {
        const classes = ["theme-selector"];
        const themes = [
            { value: 'base', label: 'Base Theme' },
            { value: 'neumorphic', label: 'Neumorphic' }
        ];

        const onSelect = (selectedTheme) => {
            document.startViewTransition(() => {
                document.documentElement.dataset.theme = selectedTheme.toLowerCase();
                localStorage.setItem('youi-theme', selectedTheme.toLowerCase());
            });
        };

        return Dropdown(themes.map(t => t.label), onSelect, true);
    };

    // Create the main page state
    const MainPage = () => {
        const classes = ["page"];
        let currentDemoIsland = null;

        const header = () => {
            const headerContent = document.createElement("div");
            headerContent.className = "header-content";

            const title = document.createElement("div");
            title.className = "title";
            title.innerHTML = `
                <h1>YoUI Dynamic Island</h1>
                <p>A morphing component system</p>
            `;

            const controls = document.createElement("div");
            controls.className = "theme-controls";
            controls.appendChild(DynamicIsland(ModeToggle()).init());
            controls.appendChild(DynamicIsland(ThemeSelector()).init());

            headerContent.append(title, controls);
            return headerContent;
        };

        const aside = () => {
            const sidebarContent = document.createElement("nav");

            const description = document.createElement("p");
            description.className = "states-description";
            description.textContent = "Select a state to see the Dynamic Island transform:";
            sidebarContent.appendChild(description);

            states.forEach(state => {
                const handleClick = () => {
                    document.startViewTransition(() => {
                        const demoContainer = document.querySelector('.demo-container');
                        if (demoContainer) {
                            if (currentDemoIsland) {
                                currentDemoIsland.remove();
                            }
                            currentDemoIsland = DynamicIsland(state.component()).init();
                            demoContainer.appendChild(currentDemoIsland);

                            const articleContent = document.querySelector('.state-info');
                            if (articleContent) {
                                articleContent.innerHTML = `
                                    <h2>${state.label}</h2>
                                    <p>${state.description}</p>
                                `;
                            }
                        }
                    });
                };

                const navItem = DynamicIsland(NavItem(state.label, state.description, handleClick)).init();
                sidebarContent.appendChild(navItem);
            });

            return sidebarContent;
        };

        const main = () => {
            const mainContent = document.createElement("div");
            mainContent.className = "demo-container";
            currentDemoIsland = DynamicIsland(states[0].component()).init();
            mainContent.appendChild(currentDemoIsland);
            return mainContent;
        };

        const article = () => {
            const articleContent = document.createElement("div");
            articleContent.className = "state-info";

            // Add token controls
            const tokenControlsContainer = document.createElement("div");
            tokenControlsContainer.className = "token-controls-container";
            tokenControlsContainer.appendChild(
                DynamicIsland(TokenControls(defaultTokenGroups)).init()
            );

            articleContent.append(tokenControlsContainer);
            return articleContent;
        };

        const footer = () => {
            const footerContent = document.createElement("div");
            footerContent.innerHTML = `
                <p>Built with YoUI - A Dynamic Island Component System</p>
            `;
            return footerContent;
        };

        return {
            classes,
            header,
            aside,
            main,
            article,
            footer
        };
    };

    // Initialize with stored preferences
    const initializePreferences = () => {
        const storedMode = localStorage.getItem('youi-mode') || 'light';
        const storedTheme = localStorage.getItem('youi-theme') || 'base';
        document.documentElement.dataset.mode = storedMode;
        document.documentElement.dataset.theme = storedTheme;
    };

    initializePreferences();
    return DynamicIsland(MainPage()).init();
};

export default YoUI;