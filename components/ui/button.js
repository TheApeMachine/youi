export const Button = (label = "Dynamic Island", onClick = null) => {
    const classes = ["button"];

    const state = {
        label
    };

    const header = () => "";
    const aside = () => "";
    const main = () => state.label;
    const article = () => "";
    const footer = () => "";

    const handleClick = (e) => {
        if (onClick) {
            return onClick();
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
        events: {
            click: handleClick
        }
    };
};

export default Button;