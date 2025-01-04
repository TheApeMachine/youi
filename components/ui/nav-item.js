export const NavItem = ({
    label,
    description,
    events
}) => {
    return {
        classes: ["nav-item"],
        header: () => {
            const headerEl = document.createElement("strong");
            headerEl.textContent = label;
            return headerEl;
        },
        aside: () => "",
        main: () => {
            const descEl = document.createElement("span");
            descEl.textContent = description;
            return descEl;
        },
        article: () => "",
        footer: () => "",
        events
    };
};

export default NavItem; 