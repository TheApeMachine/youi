export const NavItem = (label, description, onClick) => {
    const classes = ["nav-item"];

    const header = () => {
        const headerEl = document.createElement("strong");
        headerEl.textContent = label;
        return headerEl;
    };

    const main = () => {
        const descEl = document.createElement("span");
        descEl.textContent = description;
        return descEl;
    };

    return {
        classes,
        header,
        aside: () => "",
        main,
        article: () => "",
        footer: () => "",
        onClick
    };
};

export default NavItem; 