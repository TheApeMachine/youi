import DynamicIsland from "../dynamic-island.js";

export const TokenControls = (tokenGroups) => {
    const classes = ["token-controls"];
    const STORAGE_KEY = 'youi-custom-tokens';

    // Load stored token values
    const loadStoredTokens = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const tokens = JSON.parse(stored);
            Object.entries(tokens).forEach(([token, value]) => {
                document.documentElement.style.setProperty(token, value);
            });
            return tokens;
        }
        return null;
    };

    // Save current token values
    const saveTokens = () => {
        const styles = {};
        Object.entries(tokenGroups).forEach(([group, tokens]) => {
            Object.keys(tokens).forEach(token => {
                styles[token] = getComputedStyle(document.documentElement)
                    .getPropertyValue(token).trim();
            });
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(styles));
    };

    // DOM Helper functions
    const createElement = (tag, className = '', attributes = {}) => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        Object.entries(attributes).forEach(([key, value]) => {
            element[key] = value;
        });
        return element;
    };

    // Value formatting helpers
    const formatValue = (value, token) => {
        if (token.includes('duration')) return `${value}s`;
        if (token.includes('radius') || token.includes('width') ||
            token.includes('padding') || token.includes('margin')) return `${value}px`;
        return value;
    };

    // Input configuration helpers
    const getInputConfig = (token) => {
        if (token.includes('color')) {
            return { type: 'color' };
        } else if (token.includes('radius') || token.includes('width') ||
            token.includes('padding') || token.includes('margin')) {
            return {
                type: 'range',
                min: '0',
                max: token.includes('padding') || token.includes('margin') ? '64' : '48',
                step: '1'
            };
        } else if (token.includes('duration')) {
            return { type: 'range', min: '0', max: '1', step: '0.1' };
        } else if (token.includes('opacity')) {
            return { type: 'range', min: '0', max: '1', step: '0.05' };
        }
        return { type: 'text' };
    };

    // Create input element with configuration
    const createInput = (token, initialValue) => {
        const config = getInputConfig(token);
        const input = createElement('input', '', config);
        input.value = initialValue;
        return input;
    };

    // Value update handler
    const createValueUpdateHandler = (token, valueDisplay) => (value) => {
        const formattedValue = formatValue(value, token);
        document.documentElement.style.setProperty(token, formattedValue);
        valueDisplay.textContent = formattedValue;
        saveTokens();
    };

    // Create a token control group as a dynamic island
    const createTokenGroup = (groupName, tokens) => {
        const TokenGroup = () => {
            const groupClasses = ["token-group"];
            let isExpanded = false;

            const header = () => {
                const headerEl = createElement('div', 'token-group-header');
                headerEl.innerHTML = `
                    <span>${groupName}</span>
                    <span class="group-icon">${isExpanded ? '−' : '+'}</span>
                `;
                return headerEl;
            };

            const main = () => {
                if (!isExpanded) return "";

                const container = createElement('div', 'token-controls-group');
                Object.entries(tokens).forEach(([token, defaultValue]) => {
                    const control = createElement('div', 'token-control');
                    const label = createElement('label');
                    label.textContent = token.replace(/^--/, '').replace(/-/g, ' ');

                    const valueDisplay = createElement('span', 'value-display');
                    const storedTokens = loadStoredTokens();
                    const initialValue = storedTokens?.[token] || defaultValue;

                    const input = createInput(token, initialValue);
                    const updateValue = createValueUpdateHandler(token, valueDisplay);
                    valueDisplay.textContent = formatValue(input.value, token);

                    input.addEventListener('input', (e) => updateValue(e.target.value));

                    const labelContainer = createElement('div', 'label-container');
                    labelContainer.append(label, valueDisplay);
                    control.append(labelContainer, input);
                    container.appendChild(control);
                });
                return container;
            };

            const onClick = () => {
                isExpanded = !isExpanded;
                const island = document.querySelector(`.token-group[data-group="${groupName}"]`);
                if (island) {
                    document.startViewTransition(() => {
                        const mainEl = island.querySelector('main');
                        const headerEl = island.querySelector('.token-group-header');
                        const iconEl = headerEl.querySelector('.group-icon');

                        mainEl.innerHTML = '';
                        mainEl.appendChild(main());
                        iconEl.textContent = isExpanded ? '−' : '+';
                    });
                }
            };

            return {
                classes: groupClasses,
                header,
                aside: () => "",
                main,
                article: () => "",
                footer: () => "",
                onClick
            };
        };

        const groupIsland = DynamicIsland(TokenGroup());
        const island = groupIsland.init();
        island.dataset.group = groupName;
        return island;
    };

    const header = () => {
        const headerEl = createElement('div');
        headerEl.innerHTML = `
            <h2>Theme Customization</h2>
            <p>Modify design tokens to create your own theme</p>
        `;
        return headerEl;
    };

    const main = () => {
        const container = createElement('div', 'token-groups');
        Object.entries(tokenGroups).forEach(([group, tokens]) => {
            container.appendChild(createTokenGroup(group, tokens));
        });
        return container;
    };

    const footer = () => {
        const footerEl = createElement('div', 'token-actions');
        const resetButton = createElement('button', 'reset-button', {
            textContent: 'Reset to Defaults'
        });

        resetButton.addEventListener('click', () => {
            if (confirm("Reset all values to defaults?")) {
                localStorage.removeItem(STORAGE_KEY);
                Object.entries(tokenGroups).forEach(([group, tokens]) => {
                    Object.entries(tokens).forEach(([token, value]) => {
                        document.documentElement.style.setProperty(token, value);
                    });
                });
                location.reload();
            }
        });

        footerEl.appendChild(resetButton);
        return footerEl;
    };

    // Initialize with stored values
    loadStoredTokens();

    return {
        classes,
        header,
        aside: () => "",
        main,
        article: () => "",
        footer
    };
};

// Default token groups to expose for customization
export const defaultTokenGroups = {
    'Colors': {
        '--color-background': '#ffffff',
        '--color-background-hover': '#f5f5f5',
        '--color-text': '#1a1a1a',
        '--color-primary': '#007AFF',
        '--color-secondary': '#5856D6',
        '--color-success': '#34C759',
        '--color-warning': '#FF9500',
        '--color-error': '#FF3B30'
    },
    'Typography': {
        '--font-size-xs': '12px',
        '--font-size-sm': '14px',
        '--font-size-md': '16px',
        '--font-size-lg': '18px',
        '--font-size-xl': '24px',
        '--line-height': '1.5'
    },
    'Spacing': {
        '--spacing-xs': '4px',
        '--spacing-sm': '8px',
        '--spacing-md': '16px',
        '--spacing-lg': '24px',
        '--spacing-xl': '32px'
    },
    'Borders': {
        '--border-width': '1px',
        '--border-radius': '12px',
        '--border-radius-sm': '6px',
        '--border-radius-lg': '16px',
        '--border-style': 'solid'
    },
    'Padding': {
        '--padding-all': '16px',
        '--padding-top': '16px',
        '--padding-right': '16px',
        '--padding-bottom': '16px',
        '--padding-left': '16px'
    },
    'Shadows': {
        '--shadow-color': 'rgba(0,0,0,0.1)',
        '--shadow-offset-x': '0px',
        '--shadow-offset-y': '4px',
        '--shadow-blur': '12px',
        '--shadow-spread': '0px'
    },
    'Animation': {
        '--transition-duration': '0.3s',
        '--transition-timing': 'cubic-bezier(0.4, 0, 0.2, 1)',
        '--hover-transform': 'translateY(-2px)',
        '--hover-scale': '1.05',
        '--animation-bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
};

export default TokenControls; 