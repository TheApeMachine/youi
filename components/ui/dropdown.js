export const Dropdown = ({
    items = [],
    effect = null
}) => {
    const state = {
        isOpen: false,
        selectedItem: items[0] || "Select"
    };

    const getItemLabel = (item) => {
        return typeof item === 'object' ? item.label : item;
    };

    const getItemValue = (item) => {
        return typeof item === 'object' ? item.value : item;
    };

    const header = () => "";
    const aside = () => "";
    const main = () => getItemLabel(state.selectedItem);
    const article = () => "";
    const footer = () => {
        const list = document.createElement("ul");
        items.forEach((item) => {
            const li = document.createElement("li");
            li.textContent = getItemLabel(item);
            li.addEventListener('click', (e) => {
                e.stopPropagation();
                handleSelect(null, item);
            });
            list.appendChild(li);
        });
        return list;
    };

    const onClick = (e) => {
        const island = e.target.closest('.dynamic-island');
        if (!island) return;

        island.classList.toggle("open");
        state.isOpen = !state.isOpen;
    };

    const handleSelect = (id, item) => {
        state.selectedItem = item;
        if (effect) effect(getItemValue(item));

        const island = document.getElementById(id);
        if (!island) return;

        const main = document.getElementById(`${id}-main`);
        main.textContent = getItemLabel(item);
        island.classList.remove("open");
        state.isOpen = false;
    };

    return {
        classes: ["dropdown"],
        header,
        aside,
        main,
        article,
        footer,
        events: {
            click: onClick,
            select: handleSelect
        }
    };
};

export default Dropdown;