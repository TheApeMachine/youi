export const Accordion = ({
    label,
    content = null
}) => {
    const state = {
        isExpanded: false
    };

    const header = () => {
        const labelSpan = document.createElement('span');
        labelSpan.textContent = label;
        const iconSpan = document.createElement('span');
        iconSpan.className = 'accordion-icon';
        iconSpan.textContent = state.isExpanded ? '−' : '+';
        return [labelSpan, iconSpan];
    };

    const main = () => content;

    const handleClick = (e) => {
        state.isExpanded = !state.isExpanded;

        const island = e.target;
        if (!island) return;

        console.log(island);

        const iconEl = island.querySelector('.accordion-icon');
        iconEl.textContent = state.isExpanded ? '−' : '+';

        island.classList.toggle('open', state.isExpanded);
    };

    return {
        classes: ["accordion"],
        header,
        aside: () => "",
        main,
        article: () => "",
        footer: () => "",
        state,
        events: {
            click: handleClick
        }
    };
};

export default Accordion; 