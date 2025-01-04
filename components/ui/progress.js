export const Progress = ({
    progress = 0,
    label = "Default loading label...",
    effect = null
}) => {
    const classes = ["progress"];

    const header = () => {
        const labelEl = document.createElement("label");
        labelEl.textContent = label;
        return labelEl;
    };

    const aside = () => "";

    const main = () => {
        const progressBar = document.createElement("progress");
        progressBar.value = progress;
        progressBar.max = 100;
        return progressBar;
    };

    const article = () => `${progress}%`;

    const footer = () => {
        return "";
    };

    if (effect) {
        effect();
    }

    return {
        classes,
        header,
        aside,
        main,
        article,
        footer
    }
}

export default Progress; 