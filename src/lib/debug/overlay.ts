export const overlay = () => {
    let isMinimized = false;

    const createDiv = (className: string, parent: HTMLElement | null = null, textContent: string | null = null) => {
        const el = document.createElement('div');
        el.className = className;
        if (textContent) el.textContent = textContent;
        if (parent) parent.appendChild(el);
        return el;
    }

    const createButton = (className: string, parent: HTMLElement | null = null, textContent: string | null = null, onclick: () => void) => {
        const el = document.createElement('button');
        el.className = className;
        if (textContent) el.textContent = textContent;
        if (parent) parent.appendChild(el);
        if (onclick) el.onclick = onclick;
        return el;
    }

    const rootContainer = createDiv('debug-root');
    const container = createDiv('debug-overlay', rootContainer);
    const header = createDiv('debug-header', container);
    const title = createDiv('debug-header-title', header, 'Debug Tools');
    const controls = createDiv('debug-header-controls', header);
    const contentGrid = createDiv('debug-content-grid', container);
    const toolbox = createDiv('debug-toolbox', container);

    // Add minimize/maximize functionality
    const minimizeButton = createButton('debug-button', controls, '−', () => {
        isMinimized = !isMinimized;
        container.classList.toggle('minimized', isMinimized);
        minimizeButton.textContent = isMinimized ? '+' : '−';
    });

    // Add toolbox toggle
    const toolboxToggle = createButton('debug-button', controls, '🧰', () => toolbox.classList.toggle('hidden'));

    return {
        rootContainer,
        container,
        header,
        title,
        controls,
        contentGrid,
        toolbox,
        minimizeButton,
        toolboxToggle
    }
}
