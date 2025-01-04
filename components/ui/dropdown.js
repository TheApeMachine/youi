export const Dropdown = (items = [], onSelect = null) => {
    const state = {
        isOpen: false,
        selectedItem: items[0] || "Select"
    };

    const header = (id) => "";
    const aside = (id) => "";
    const main = (id) => state.selectedItem;
    const article = (id) => "";
    const footer = (id) => {
        const list = document.createElement("ul");
        items.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = item;
            list.appendChild(li);
        });
        return list;
    };

    const onClick = (id) => {
        const island = document.getElementById(id);

        if (!state.isOpen) {
            island.style.position = 'absolute';
        } else {
            island.style.position = 'static';
        }

        island.classList.toggle("open");
        state.isOpen = !state.isOpen;
    };

    const handleSelect = (id, item) => {
        if (onSelect) onSelect(item);
        const island = document.getElementById(id);
        const main = document.getElementById(`${id}-main`);
        main.textContent = item;
        island.classList.remove("open");
        island.style.position = '';
        island.style.top = '';
        island.style.left = '';
        island.style.width = '';
        state.isOpen = false;
    };

    return {
        classes: ["dropdown"],
        header,
        aside,
        main,
        article,
        footer,
        onClick,
        onSelect: handleSelect
    };
};

export default Dropdown;