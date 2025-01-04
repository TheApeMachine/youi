const DynamicIsland = ({
    classes = [],
    header,
    aside,
    main,
    article,
    footer,
    onClick = null,
    onSelect = null
}) => {
    const id = window.crypto.randomUUID();

    const init = () => {
        const island = document.createElement("div");
        island.id = id;
        island.className = ["dynamic-island", ...classes].join(" ");

        const headerElement = document.createElement("header");
        const asideElement = document.createElement("aside");
        const mainElement = document.createElement("main");
        const articleElement = document.createElement("article");
        const footerElement = document.createElement("footer");

        // Set unique view transition names based on component class
        const componentClass = classes[0] || 'default';
        headerElement.style.viewTransitionName = `${componentClass}-header`;
        asideElement.style.viewTransitionName = `${componentClass}-aside`;
        mainElement.style.viewTransitionName = `${componentClass}-main`;
        articleElement.style.viewTransitionName = `${componentClass}-article`;
        footerElement.style.viewTransitionName = `${componentClass}-footer`;

        headerElement.append(header());
        asideElement.append(aside());
        mainElement.append(main());
        articleElement.append(article());
        footerElement.append(footer());

        island.append(
            headerElement,
            asideElement,
            mainElement,
            articleElement,
            footerElement
        );

        if (onClick) {
            island.addEventListener('click', onClick);
        }

        return island;
    }

    const update = (newProps) => {
        const island = document.getElementById(id);
        if (!island) return;

        document.startViewTransition(() => {
            const headerEl = island.querySelector("header");
            const asideEl = island.querySelector("aside");
            const mainEl = island.querySelector("main");
            const articleEl = island.querySelector("article");
            const footerEl = island.querySelector("footer");

            headerEl.innerHTML = '';
            asideEl.innerHTML = '';
            mainEl.innerHTML = '';
            articleEl.innerHTML = '';
            footerEl.innerHTML = '';

            headerEl.append(newProps.header());
            asideEl.append(newProps.aside());
            mainEl.append(newProps.main());
            articleEl.append(newProps.article());
            footerEl.append(newProps.footer());
        });
    };

    return { init, update };
};

export default DynamicIsland;
