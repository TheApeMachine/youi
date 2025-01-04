const DynamicIsland = (component) => {
    const id = window.crypto.randomUUID();

    // Configuration constants
    const SECTIONS = ['header', 'aside', 'main', 'article', 'footer'];
    const BASE_CLASSES = ['dynamic-island'];

    // Helper functions
    const createElement = (type, section) => {
        const element = document.createElement(type);
        element.id = `${id}-${section}`;
        return element;
    };

    const getClasses = (componentClasses = []) => {
        return [...BASE_CLASSES, ...componentClasses].join(" ");
    };

    const wrapInViewTransition = (callback) => {
        return document.startViewTransition(() => callback());
    };

    const updateContent = (element, contentFn = () => "") => {
        const content = contentFn(id);
        element.replaceChildren(...(Array.isArray(content) ? content : [content]));
    };

    const createStructure = () => {
        const elements = Object.fromEntries(
            SECTIONS.map(section => [
                section,
                createElement(section, section)
            ])
        );

        // Update initial content
        SECTIONS.forEach(section => {
            updateContent(elements[section], component[section]);
        });

        return elements;
    };

    const init = () => {
        const island = document.createElement("div");
        island.id = id;
        island.className = getClasses(component.classes);
        island.style.viewTransitionName = `island-${id}`;

        const elements = createStructure();
        island.append(...Object.values(elements));

        if (component.events) {
            Object.entries(component.events).forEach(([event, handler]) => {
                window.eventManager.subscribe(id, event, handler);
            });
        }

        return island;
    };

    const update = (newComponent) => {
        const island = document.getElementById(id);
        if (!island) return;

        wrapInViewTransition(() => {
            // Update classes
            island.className = getClasses(newComponent.classes);

            // Update content
            SECTIONS.forEach(section => {
                const element = document.getElementById(`${id}-${section}`);
                updateContent(element, newComponent[section]);
            });

            // Unsubscribe from old events
            if (component.events) {
                Object.entries(component.events).forEach(([event, handler]) => {
                    window.eventManager.unsubscribe(id, event, handler);
                });
            }

            // Subscribe to new events
            if (newComponent.events) {
                Object.entries(newComponent.events).forEach(([event, handler]) => {
                    window.eventManager.subscribe(id, event, handler);
                });
            }
        });
    };

    return { init, update };
};

export default DynamicIsland;
