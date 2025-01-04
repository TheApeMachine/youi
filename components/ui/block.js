export const Block = ({
    header,
    aside,
    main,
    article,
    footer
}) => {
    const classes = ["block"];

    return {
        classes,
        header,
        aside,
        main,
        article,
        footer
    };
};

export default Block;