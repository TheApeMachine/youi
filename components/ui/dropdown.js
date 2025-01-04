export const Dropdown = (items = [], onSelect = null, isThemeSelector = false) => {
    const classes = ["dropdown"];
    if (isThemeSelector) {
        classes.push("theme-selector");
    }
    let isOpen = false;
    // Generate a unique ID for this dropdown instance
    const dropdownId = `dropdown-${Math.random().toString(36).substr(2, 9)}`;
    classes.push(dropdownId);

    const header = () => {
        return "";
    };

    const aside = () => {
        return "";
    };

    const main = () => {
        return items[0] || "Select";
    };

    const article = () => {
        return "";
    };

    const footer = () => {
        if (!isOpen) return "";

        const footerElement = document.createElement("ul");
        items.forEach((item, index) => {
            const itemElement = document.createElement("li");
            itemElement.className = "item";
            itemElement.style.viewTransitionName = `${dropdownId}-item-${index}`;
            itemElement.textContent = item;

            if (onSelect) {
                itemElement.addEventListener('click', () => {
                    onSelect(item);
                    isOpen = false;
                    document.startViewTransition(() => {
                        const dropdownFooter = document.querySelector(`.${dropdownId} footer`);
                        if (dropdownFooter) {
                            dropdownFooter.innerHTML = '';
                        }
                    });
                });
            }

            footerElement.append(itemElement);
        });
        return footerElement;
    };

    const onClick = () => {
        isOpen = !isOpen;
        document.startViewTransition(() => {
            const dropdownFooter = document.querySelector(`.${dropdownId} footer`);
            if (dropdownFooter) {
                dropdownFooter.innerHTML = '';
                if (isOpen) {
                    dropdownFooter.append(footer());
                }
            }
        });
    };

    return {
        classes,
        header,
        aside,
        main,
        article,
        footer,
        onClick
    }
}

export default Dropdown;