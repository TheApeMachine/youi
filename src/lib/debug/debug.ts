import "@/lib/debug/debug.css";
import { DebugEntry, DebugModuleInstance } from './types';
import { overlay } from './overlay';

type ConsoleMethod = 'log' | 'warn' | 'error' | 'info' | 'debug';

const AVAILABLE_MODULES = ['logs', 'performance', 'router', 'state', 'events', 'css-editor'] as const;
type ModuleId = typeof AVAILABLE_MODULES[number];

interface DebugOverlay {
    destroy: () => void;
    addLog: (entry: DebugEntry) => void;
}

const DEFAULT_MODULES: ModuleId[] = ['router', 'state', 'events', 'css-editor'];

const allowDrop = (e: DragEvent) => {
    e.preventDefault();
};

const drag = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    // Set the ID of the dragged element
    e.dataTransfer?.setData('text/plain', target.id);
    target.classList.add('dragging');
};

const drop = (e: DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer?.getData('text/plain');
    if (!data) return;

    const draggedElement = document.getElementById(data) as HTMLElement;
    if (!draggedElement) return;

    const target = e.target as HTMLElement;
    const dropTarget = target.closest('.debug-section') as HTMLElement;
    if (!dropTarget) return;

    const container = dropTarget.parentElement!;
    const sections = Array.from(container.children);
    const draggedIndex = sections.indexOf(draggedElement);
    const dropIndex = sections.indexOf(dropTarget);
    if (draggedIndex === -1 || dropIndex === -1) return;

    // If dropping below its original position, insert after dropTarget
    // Otherwise, insert before dropTarget
    if (draggedIndex < dropIndex) {
        container.insertBefore(draggedElement, dropTarget.nextSibling);
    } else {
        container.insertBefore(draggedElement, dropTarget);
    }

    draggedElement.classList.remove('dragging');
};

const dragEnd = (e: DragEvent) => {
    const target = e.target as HTMLElement;
    if (!target) return;
    target.classList.remove('dragging');
};

export const createDebugOverlay = (): DebugOverlay => {
    let observer: MutationObserver;
    const originalConsole: Record<ConsoleMethod, Function> = {
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
        debug: console.debug
    };
    let isMinimized = false;
    let activeModules = new Map<ModuleId, DebugModuleInstance>();
    let globalAddLog: ((entry: DebugEntry) => void) | null = null;

    // Store the overlay instance
    const overlayInstance = overlay();
    const { rootContainer, contentGrid, toolbox } = overlayInstance;

    document.documentElement.appendChild(rootContainer);

    const loadModule = async (moduleId: ModuleId, index: number) => {
        try {
            const { setup } = await import(`./modules/${moduleId}`);

            const section = document.createElement('section');
            section.id = moduleId;
            section.className = 'debug-section';
            section.draggable = true;
            section.ondrag = drag;
            section.ondragend = dragEnd;

            const instance = await setup.setup({
                addLog: (entry: DebugEntry) => globalAddLog?.(entry),
                container: section
            });

            if (!instance?.component) {
                throw new Error(`Module ${moduleId} setup did not return valid instance`);
            }

            section.appendChild(instance.component);
            contentGrid.appendChild(section);
            activeModules.set(moduleId, instance);

            const tool = toolbox.querySelector(`[data-module-id="${moduleId}"]`);
            tool?.remove();
        } catch (error) {
            console.error(`Failed to load module ${moduleId}:`, error);
            const errorEl = document.createElement('div');
            errorEl.className = 'debug-section error';
            errorEl.innerHTML = `
                <h3>Error loading ${moduleId}</h3>
                <pre>${error instanceof Error ? error.message : String(error)}</pre>
            `;
            contentGrid.appendChild(errorEl);
        }
    };

    // Load default modules
    const initializeModules = async () => {
        // Wait for YouI core systems to be ready
        await new Promise<void>(resolve => {
            if ((window as any).youi?.isReady) {
                resolve();
                return;
            }

            const checkInterval = setInterval(() => {
                if ((window as any).youi?.isReady) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 50);

            // Also listen for the ready event as a backup
            document.addEventListener('youi:ready', () => {
                clearInterval(checkInterval);
                resolve();
            }, { once: true });
        });

        console.log('YouI is ready, loading debug modules...');

        // Now load the modules
        let index = 0;
        for (const moduleId of DEFAULT_MODULES) {
            await loadModule(moduleId, index);
            index++;
        }

        console.log('Finished loading all default modules');
        console.log('Active modules:', Array.from(activeModules.keys()));
    };

    // Start initialization
    initializeModules().catch(error => {
        console.error('Error loading default modules:', error);
    });

    // Initialize toolbox with remaining available modules
    Promise.all(
        AVAILABLE_MODULES
            .filter(moduleId => !DEFAULT_MODULES.includes(moduleId))
            .map(async (moduleId) => {
                try {
                    const { setup } = await import(`./modules/${moduleId}`);
                    const tool = document.createElement('div');
                    tool.className = 'debug-tool';
                    tool.textContent = setup.name;
                    tool.title = setup.description || '';
                    tool.draggable = true;
                    tool.dataset.moduleId = moduleId;

                    toolbox.appendChild(tool);
                } catch (error) {
                    console.error(`Failed to load module info for ${moduleId}:`, error);
                }
            })
    );

    // Make content grid a drop zone
    contentGrid.ondrop = drop;
    contentGrid.ondragover = allowDrop;

    const debugOverlay: DebugOverlay = {
        destroy: () => {
            observer?.disconnect();
            activeModules.forEach(instance => instance.cleanup?.());
            activeModules.clear();
            rootContainer.remove();

            Object.entries(originalConsole).forEach(([method, fn]) => {
                (console[method as ConsoleMethod] as any) = fn;
            });
        },
        addLog: (entry) => {
            if (globalAddLog) {
                globalAddLog(entry);
            }
        }
    };

    // Store the addLog function for modules to use
    globalAddLog = debugOverlay.addLog;

    return debugOverlay;
};
