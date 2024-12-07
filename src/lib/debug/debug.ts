import "@/lib/debug/debug.css";
import { DebugEntry, DebugModuleSetup, DebugModuleInstance } from './types';
import { overlay } from './overlay';

type ConsoleMethod = 'log' | 'warn' | 'error' | 'info' | 'debug';

const AVAILABLE_MODULES = ['logs', 'performance'] as const;
type ModuleId = typeof AVAILABLE_MODULES[number];

interface DebugOverlay {
    destroy: () => void;
    addLog: (entry: DebugEntry) => void;
}

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

    const { rootContainer, contentGrid, toolbox } = overlay();

    document.documentElement.appendChild(rootContainer);

    // Make content grid a drop zone
    contentGrid.addEventListener('dragover', (e: DragEvent) => {
        e.preventDefault();
        contentGrid.classList.add('drop-zone');
    });

    contentGrid.addEventListener('dragleave', (e: DragEvent) => {
        e.preventDefault();
        contentGrid.classList.remove('drop-zone');
    });

    contentGrid.addEventListener('drop', async (e: DragEvent) => {
        e.preventDefault();
        contentGrid.classList.remove('drop-zone');

        const moduleId = e.dataTransfer?.getData('text/plain') as ModuleId;
        if (!moduleId || !AVAILABLE_MODULES.includes(moduleId)) return;

        // Create loading element before try block
        const loadingEl = document.createElement('div');
        loadingEl.className = 'debug-section loading';
        loadingEl.textContent = `Loading ${moduleId} module...`;
        contentGrid.appendChild(loadingEl);

        try {
            // Load module
            const { setup } = await import(`./modules/${moduleId}`);
            const instance = await setup.setup({
                addLog: (entry) => globalAddLog?.(entry),
                container: contentGrid
            });

            // Replace loading element with actual component
            loadingEl.replaceWith(instance.component);
            activeModules.set(moduleId, instance);

            // Remove from toolbox
            const tool = toolbox.querySelector(`[data-module-id="${moduleId}"]`);
            tool?.remove();
        } catch (error) {
            console.error(`Failed to load module ${moduleId}:`, error);
            loadingEl.remove();
        }
    });

    // Initialize toolbox with available modules
    Promise.all(
        AVAILABLE_MODULES.map(async (moduleId) => {
            try {
                const { setup } = await import(`./modules/${moduleId}`);
                const tool = document.createElement('div');
                tool.className = 'debug-tool';
                tool.textContent = setup.name;
                tool.title = setup.description || '';
                tool.draggable = true;
                tool.dataset.moduleId = moduleId;

                tool.addEventListener('dragstart', (e: DragEvent) => {
                    e.dataTransfer?.setData('text/plain', moduleId);
                    tool.classList.add('dragging');
                });

                tool.addEventListener('dragend', () => {
                    tool.classList.remove('dragging');
                });

                toolbox.appendChild(tool);
            } catch (error) {
                console.error(`Failed to load module info for ${moduleId}:`, error);
            }
        })
    );


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
