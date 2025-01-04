/*
Toggle is a Dynamic Island state that toggles between a list of items.
*/
export const Toggle = ({
    items
}) => {
    let currentItem = items[0];

    return {
        classes: ["toggle"],
        main: () => currentItem,
        morphs: {
            onClick: () => {
                const nextItem = items[items.indexOf(currentItem) + 1];
                currentItem = nextItem;
                onChange(nextItem);
            }
        }
    };
};

export default Toggle;