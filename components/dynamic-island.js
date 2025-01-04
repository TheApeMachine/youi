const DynamicIsland = (component) => {
    const id = window.crypto.randomUUID();

    // Extract component configuration
    const {
        classes = [],
        header = () => "",
        aside = () => "",
        main = () => "",
        article = () => "",
        footer = () => "",
        onClick,
        onSelect
    } = component;

    const init = () => {
        const island = document.createElement("div");
        island.id = id;
        island.className = ["dynamic-island", ...classes].join(" ");
        island.style.viewTransitionName = `island-${id}`;

        // Create the five fundamental elements with unique IDs
        const headerElement = document.createElement("header");
        headerElement.id = `${id}-header`;

        const asideElement = document.createElement("aside");
        asideElement.id = `${id}-aside`;

        const mainElement = document.createElement("main");
        mainElement.id = `${id}-main`;

        const articleElement = document.createElement("article");
        articleElement.id = `${id}-article`;

        const footerElement = document.createElement("footer");
        footerElement.id = `${id}-footer`;

        // Add content with ID for component use
        headerElement.append(header(id));
        asideElement.append(aside(id));
        mainElement.append(main(id));
        articleElement.append(article(id));
        footerElement.append(footer(id));

        // Maintain structure
        island.append(
            headerElement,
            asideElement,
            mainElement,
            articleElement,
            footerElement
        );

        // Handle events
        if (onClick) {
            island.addEventListener('click', (e) => {
                // Don't trigger onClick if clicking a list item
                if (!e.target.closest('li')) {
                    document.startViewTransition(() => {
                        onClick(id, e);
                    });
                }
            });
        }

        if (onSelect) {
            island.addEventListener('click', (e) => {
                const item = e.target.closest('li');
                if (item) {
                    e.stopPropagation();
                    document.startViewTransition(() => {
                        onSelect(id, item.textContent, e);
                    });
                }
            });
        }

        return island;
    };

    const update = (newComponent) => {
        const island = document.getElementById(id);
        if (!island) return;

        document.startViewTransition(() => {
            const {
                classes: newClasses = [],
                header: newHeader = () => "",
                aside: newAside = () => "",
                main: newMain = () => "",
                article: newArticle = () => "",
                footer: newFooter = () => "",
                onClick: newOnClick,
                onSelect: newOnSelect
            } = newComponent;

            // Update classes
            island.className = ["dynamic-island", ...newClasses].join(" ");

            // Update content
            const headerEl = document.getElementById(`${id}-header`);
            const asideEl = document.getElementById(`${id}-aside`);
            const mainEl = document.getElementById(`${id}-main`);
            const articleEl = document.getElementById(`${id}-article`);
            const footerEl = document.getElementById(`${id}-footer`);

            headerEl.replaceChildren(newHeader(id));
            asideEl.replaceChildren(newAside(id));
            mainEl.replaceChildren(newMain(id));
            articleEl.replaceChildren(newArticle(id));
            footerEl.replaceChildren(newFooter(id));

            // Update event handlers
            const newIsland = island.cloneNode(true);
            island.replaceWith(newIsland);

            if (newOnClick) {
                newIsland.addEventListener('click', (e) => {
                    if (!e.target.closest('li')) {
                        document.startViewTransition(() => {
                            newOnClick(id, e);
                        });
                    }
                });
            }

            if (newOnSelect) {
                newIsland.addEventListener('click', (e) => {
                    const item = e.target.closest('li');
                    if (item) {
                        e.stopPropagation();
                        document.startViewTransition(() => {
                            newOnSelect(id, item.textContent, e);
                        });
                    }
                });
            }
        });
    };

    return { init, update };
};

export default DynamicIsland;
