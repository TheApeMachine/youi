import DynamicIsland from "./components/dynamic-island.js";
import Block from "./components/ui/block.js";
import Button from "./components/ui/button.js";
import Dropdown from "./components/ui/dropdown.js";
import Notification from "./components/ui/notification.js";
import Progress from "./components/ui/progress.js";
import QuickActions from "./components/ui/quick-actions.js";
import NavItem from "./components/ui/nav-item.js";
import Toggle from "./components/ui/toggle.js";
import TokenControls, { defaultTokenGroups } from "./components/ui/token-controls.js";

export const YoUI = () => {
    // Available states for the Dynamic Island
    const states = [
        {
            id: 'button',
            label: 'Button',
            description: 'A simple button that morphs on interaction',
            component: () => Button('Click me', () => states[1].component())
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

    // Create the main page state
    const MainPage = () => {
        const classes = ["page"];
        let demoIsland = null;

        const header = () => {
            return DynamicIsland(Block({
                header: () => "",
                aside: () => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <h1>YoUI Dynamic Island</h1>
                        <p>A morphing component system</p>
                    `;
                    return div;
                },
                main: () => "",
                article: () => DynamicIsland(Toggle({ items: ['🌙', '☀️'] })).init(),
                footer: () => ""
            })).init();
        };

        const aside = () => {
            const sidebarContent = document.createElement("nav");

            const description = document.createElement("p");
            description.className = "states-description";
            description.textContent = "Select a state to see the Dynamic Island transform:";
            sidebarContent.appendChild(description);

            states.forEach(state => {
                const navItem = NavItem(
                    state.label,
                    state.description,
                    () => {
                        if (demoIsland) {
                            const component = state.component();
                            demoIsland.update(component);

                            // Update state info
                            const stateInfo = document.querySelector('.state-info');
                            if (stateInfo) {
                                stateInfo.innerHTML = `
                                    <h2>${state.label}</h2>
                                    <p>${state.description}</p>
                                `;
                            }
                        }
                    }
                );

                sidebarContent.appendChild(DynamicIsland(navItem).init());
            });

            return sidebarContent;
        };

        const main = () => {
            const mainContent = document.createElement("div");
            mainContent.className = "demo-container";
            demoIsland = DynamicIsland(states[0].component());
            mainContent.appendChild(demoIsland.init());
            return mainContent;
        };

        const article = () => {
            const articleContent = document.createElement("div");
            articleContent.className = "state-info";
            articleContent.innerHTML = `
                <h2>${states[0].label}</h2>
                <p>${states[0].description}</p>
            `;

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