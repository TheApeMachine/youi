export const Button = (label = "Dynamic Island", onMorph = null) => {
    const classes = ["button"];

    const state = {
        label
    };

    const header = () => "";
    const aside = () => "";
    const main = () => state.label;
    const article = () => "";
    const footer = () => "";

    const morphs = {
        onClick: () => {
            if (onMorph) {
                return onMorph();
            }
        }
    };

    return {
        classes,
        header,
        aside,
        main,
        article,
        footer,
        state,
        morphs
    };
};

export default Button;