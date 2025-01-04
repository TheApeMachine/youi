import DynamicIsland from "../components/dynamic-island.js";
import Block from "../components/ui/block.js";
import Toggle from "../components/ui/toggle.js";
import NavItem from "../components/ui/nav-item.js";
import TokenControls from "../components/token-controls.js";
import Button from "../components/ui/button.js";
import Dropdown from "../components/ui/dropdown.js";
import Notification from "../components/ui/notification.js";
import Progress from "../components/ui/progress.js";
import QuickActions from "../components/ui/quick-actions.js";

export default () => {
    let demoIsland = null;
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
            component: () => Progress({
                progress: 0, label: 'Downloading updates...', effect: (id) => {
                    let value = 0;
                    setInterval(() => {
                        value += 1;
                        document.getElementById(`id-main > progress`).value = value;
                        document.getElementById(`id-article`).textContent = `${value}%`;
                    }, 500);
                }
            })
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

    return {
        classes: ["page"],
        header: () => {
            return DynamicIsland(Block({
                header: () => "",
                aside: () => {
                    const div = document.createElement('div');
                    div.innerHTML = `
                        <h1>YoUI</h1>
                        <p>A morphing component system</p>
                    `;
                    return div;
                },
                main: () => "",
                article: () => [
                    DynamicIsland(
                        Toggle({
                            items: [
                                { icon: "dark_mode", value: "dark" },
                                { icon: "light_mode", value: "light" }
                            ],
                            effect: (value) => {
                                document.documentElement.dataset.mode = value;
                            }
                        })
                    ).init(),
                    DynamicIsland(Dropdown({
                        items: [
                            { label: "Base Theme", value: "base" },
                            { label: "Neumorphism", value: "neumorphism" },
                            { label: "Glassmorphism", value: "glassmorphism" },
                            { label: "Neo-Brutalism", value: "neo-brutalism" },
                            { label: "Minimalism", value: "minimalism" },
                            { label: "Material Design", value: "material-design" },
                            { label: "Vintage", value: "vintage" },
                            { label: "Cyberpunk", value: "cyberpunk" },
                            { label: "Retro", value: "retro" },
                            { label: "Glamour", value: "glamour" },
                            { label: "Pastel", value: "pastel" },
                        ],
                        effect: (value) => {
                            document.documentElement.dataset.theme = value;
                        }
                    })).init()
                ],
                footer: () => ""
            })).init();
        },
        aside: () => {
            const sidebarContent = document.createElement("nav");

            const description = document.createElement("p");
            description.className = "states-description";
            description.textContent = "Select a state to see the Dynamic Island transform:";
            sidebarContent.appendChild(description);

            states.forEach(state => {
                const navItem = NavItem({
                    label: state.label,
                    description: state.description,
                    events: {
                        click: () => {
                            if (demoIsland) {
                                const component = state.component();
                                demoIsland.update(component);
                            }
                        }
                    }
                });

                sidebarContent.appendChild(DynamicIsland(navItem).init());
            });

            return sidebarContent;
        },
        main: () => {
            const mainContent = document.createElement("div");
            mainContent.className = "demo-container";
            demoIsland = DynamicIsland(states[0].component());
            mainContent.appendChild(demoIsland.init());
            return mainContent;
        },
        article: () => TokenControls(),
        footer: () => {
            const footerContent = document.createElement("div");
            footerContent.innerHTML = `
                <p>Built with YoUI - A Dynamic Island Component System</p>
            `;
            return footerContent;
        }
    }
}