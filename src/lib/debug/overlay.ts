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
        const span = document.createElement('span');
        span.classList.add("material-symbols-rounded");
        span.textContent = textContent;
        el.appendChild(span);
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

    // Setup drag and drop within content grid
    contentGrid.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggable = contentGrid.querySelector('.debug-section.dragging');
        if (!draggable) return;
        
        const afterElement = getDragAfterElement(contentGrid, e.clientY);
        if (afterElement && afterElement !== draggable) {
            contentGrid.insertBefore(draggable, afterElement);
        } else if (!afterElement && draggable !== contentGrid.lastElementChild) {
            contentGrid.appendChild(draggable);
        }
    });

    // Helper function to determine where to place the dragged element
    const getDragAfterElement = (container: HTMLElement, y: number) => {
        const draggableElements = [...container.querySelectorAll('.debug-section:not(.dragging)')];
        
        return draggableElements.reduce<{ offset: number, element: Element | null }>((closest, child) => {
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
        setupToolDragging: (toolElement: HTMLElement) => {
            toolElement.classList.add('debug-section');
            
            // Create header if it doesn't exist
            let toolHeader = toolElement.querySelector('.debug-section-header') as HTMLElement;
            if (!toolHeader) {
                toolHeader = document.createElement('div');
                toolHeader.className = 'debug-section-header';
                if (toolElement.firstChild) {
                    toolElement.insertBefore(toolHeader, toolElement.firstChild);
                } else {
                    toolElement.appendChild(toolHeader);
                }
            }
            
            toolHeader.style.cursor = 'grab';
            toolElement.setAttribute('draggable', 'true');
            
            toolElement.addEventListener('dragstart', () => {
                toolElement.classList.add('dragging');
            });
            
            toolElement.addEventListener('dragend', () => {
                toolElement.classList.remove('dragging');
            });
            
            toolHeader.addEventListener('mousedown', () => {
                toolElement.setAttribute('draggable', 'true');
            });
            
            toolHeader.addEventListener('mouseup', () => {
                toolElement.setAttribute('draggable', 'false');
            });
            
            // Prevent dragging from content
            toolElement.addEventListener('mousedown', (e) => {
                const target = e.target as HTMLElement;
                if (!toolHeader.contains(target)) {
                    toolElement.setAttribute('draggable', 'false');
                }
            });
        }
    }
}