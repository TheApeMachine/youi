export const Progress = (progress = 0, label = "Loading...") => {
    const classes = ["progress"];

    const header = () => {
        const labelEl = document.createElement("div");
        labelEl.className = "progress-label";
        labelEl.textContent = label;
        return labelEl;
    };

    const aside = () => {
        return "";
    };

    const main = () => {
        const progressContainer = document.createElement("div");
        progressContainer.className = "progress-container";

        const progressBar = document.createElement("div");
        progressBar.className = "progress-bar";
        progressBar.style.width = `${progress}%`;

        progressContainer.appendChild(progressBar);
        return progressContainer;
    };

    const article = () => {
        const percentEl = document.createElement("div");
        percentEl.className = "progress-percent";
        percentEl.textContent = `${progress}%`;
        return percentEl;
    };

    const footer = () => {
        return "";
    };

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