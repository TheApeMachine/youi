type DragPosition = {
    offset: number;
    element: Element | null;
};

export const overlay = () => {
    let isMinimized = false;
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

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
        const span = document.createElement('span');
        span.classList.add("material-symbols-rounded");
        span.textContent = textContent;
        el.appendChild(span);
        if (parent) parent.appendChild(el);
        if (onclick) el.onclick = onclick;
        return el;
    }

    const rootContainer = createDiv('debug-root');
    const resizeHandle = createDiv('debug-resize-handle', rootContainer);
    const container = createDiv('debug-overlay', rootContainer);
    const header = createDiv('debug-header', container);
    const title = createDiv('debug-header-title', header, 'Debug Tools');
    const controls = createDiv('debug-header-controls', header);
    const contentGrid = createDiv('debug-content-grid', container);
    const toolbox = createDiv('debug-toolbox', container);

    // Setup drag and drop within content grid
    contentGrid.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggable = contentGrid.querySelector('.debug-section.dragging');
        if (!draggable) return;

        const afterElement = getDragAfterElement(contentGrid, e.clientY);
        if (afterElement) {
            contentGrid.insertBefore(draggable, afterElement);
        } else {
            contentGrid.appendChild(draggable);
        }
    });

    // Helper function to determine where to place the dragged element
    const getDragAfterElement = (container: HTMLElement, y: number) => {
        const draggableElements = [...container.querySelectorAll('.debug-section:not(.dragging)')];

        return draggableElements.reduce<DragPosition>((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
    };

    // Add minimize/maximize functionality
    const minimizeButton = createButton('debug-button', controls, '−', () => {
        isMinimized = !isMinimized;
        container.classList.toggle('minimized', isMinimized);
        minimizeButton.textContent = isMinimized ? '+' : '−';
    });

    // Add toolbox toggle
    const toolboxToggle = createButton('debug-button', controls, 'construction', () => toolbox.classList.toggle('hidden'));

    // Add resize functionality
    const startResize = (e: MouseEvent) => {
        isResizing = true;
        startX = e.clientX;
        startWidth = rootContainer.offsetWidth;
        resizeHandle.classList.add('resizing');
        document.addEventListener('mousemove', handleResize);
        document.addEventListener('mouseup', stopResize);
    };

    const handleResize = (e: MouseEvent) => {
        if (!isResizing) return;
        const width = startWidth - (e.clientX - startX);
        rootContainer.style.width = `${Math.max(400, Math.min(1200, width))}px`;
    };

    const stopResize = () => {
        isResizing = false;
        resizeHandle.classList.remove('resizing');
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    };

    resizeHandle.addEventListener('mousedown', startResize);

    // Add module resize functionality
    const setupModuleResize = (toolElement: HTMLElement) => {
        const resizeHandle = createDiv('debug-section-resize', toolElement);
        let startY = 0;
        let startHeight = 0;
        let isResizing = false;

        const startModuleResize = (e: MouseEvent) => {
            isResizing = true;
            startY = e.clientY;
            startHeight = toolElement.offsetHeight;
            resizeHandle.classList.add('resizing');
            document.addEventListener('mousemove', handleModuleResize);
            document.addEventListener('mouseup', stopModuleResize);
        };

        const handleModuleResize = (e: MouseEvent) => {
            if (!isResizing) return;
            const height = startHeight + (e.clientY - startY);
            toolElement.style.height = `${Math.max(100, height)}px`;
        };

        const stopModuleResize = () => {
            isResizing = false;
            resizeHandle.classList.remove('resizing');
            document.removeEventListener('mousemove', handleModuleResize);
            document.removeEventListener('mouseup', stopModuleResize);
        };

        resizeHandle.addEventListener('mousedown', startModuleResize);
    };

    // Update setupToolDragging function
    const setupToolDragging = (toolElement: HTMLElement) => {
        toolElement.classList.add('debug-section');

        // Make the entire section draggable
        toolElement.setAttribute('draggable', 'true');
        toolElement.setAttribute('ondragstart', 'drag(event)')

        setupModuleResize(toolElement);
    };

    return {
        rootContainer,
        container,
        header,
        title,
        controls,
        contentGrid,
        toolbox,
        minimizeButton,
        toolboxToggle,
        setupToolDragging
    };
}