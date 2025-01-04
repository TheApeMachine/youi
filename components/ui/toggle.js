/*
Toggle is a Dynamic Island state that toggles between a list of items.
*/
export const Toggle = ({
    items,
    effect
}) => {
    let currentItemIndex = 0;

    return {
        classes: ["toggle"],
        main: () => {
            const span = document.createElement('span');
            span.className = "material-symbols-rounded";
            span.textContent = items[currentItemIndex].icon;
            return span;
        },
        events: {
            click: (e) => {
                // Find the span within the dynamic island structure
                const span = e.target.closest('.dynamic-island').querySelector('span');
                currentItemIndex = (currentItemIndex + 1) % items.length;
                span.textContent = items[currentItemIndex].icon;
                effect(items[currentItemIndex].value);
            }
        }
    };
};

export default Toggle;