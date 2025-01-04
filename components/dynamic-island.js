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
        element.replaceChildren(contentFn(id));
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

    // Event handlers
    const attachClickHandler = (element, onClick) => {
        if (!onClick) return;

        element.addEventListener('click', (e) => {
            if (!e.target.closest('li')) {
                wrapInViewTransition(() => onClick(id, e));
            }
        });
    };

    const attachSelectHandler = (element, onSelect) => {
        if (!onSelect) return;

        element.addEventListener('click', (e) => {
            const item = e.target.closest('li');
            if (item) {
                e.stopPropagation();
                wrapInViewTransition(() => onSelect(id, item.textContent, e));
            }
        });
    };

    const init = () => {
        const island = document.createElement("div");
        island.id = id;
        island.className = getClasses(component.classes);
        island.style.viewTransitionName = `island-${id}`;

        const elements = createStructure();
        island.append(...Object.values(elements));

        attachClickHandler(island, component.onClick);
        attachSelectHandler(island, component.onSelect);

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

            // Update event handlers
            const newIsland = island.cloneNode(true);
            island.replaceWith(newIsland);

            attachClickHandler(newIsland, newComponent.onClick);
            attachSelectHandler(newIsland, newComponent.onSelect);
        });
    };

    return { init, update };
};

export default DynamicIsland;
