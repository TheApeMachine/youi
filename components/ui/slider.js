export const Slider = ({ label, min, max, step, value, withInput = true, effect = null }) => {
    const state = {
        value
    };

    const handleChange = (e) => {
        const newValue = e.target.value;
        state.value = newValue;
        if (effect) effect(newValue);
    };

    return {
        classes: ["slider"],
        header: () => {
            const labelEl = document.createElement("label");
            labelEl.textContent = label;
            return labelEl;
        },
        aside: () => "",
        main: () => {
            const inputEl = document.createElement("input");
            inputEl.type = "range";
            inputEl.min = min;
            inputEl.max = max;
            inputEl.step = step;
            inputEl.value = value;
            return inputEl;
        },
        article: () => {
            if (!withInput) return "";

            const articleEl = document.createElement("input");
            articleEl.type = "number";
            articleEl.min = min;
            articleEl.max = max;
            articleEl.step = step;
            articleEl.value = value;
            return articleEl;
        },
        footer: () => "",
        state,
        events: {
            change: handleChange
        }
    };
};

export default Slider;