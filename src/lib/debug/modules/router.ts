import { DebugModuleSetup } from '../types';
import { routerManager } from '@/lib/router/manager';
import { eventManager } from '@/lib/event';
import { EventPayload } from '@/lib/event/types';

interface RouterState {
    currentSlide: string;
    currentIsland?: string;
    slideHistory: string[];
    islandStates: Map<string, Map<string, any>>;
}

export const setup: DebugModuleSetup = {
    name: 'Router',
    description: 'Monitor router state and navigation',
    setup: async ({ addLog, container }) => {
        const content = document.createElement('div');
        content.className = 'router-content';

        // Create router state display
        const stateDisplay = document.createElement('div');
        stateDisplay.className = 'router-state';
        content.appendChild(stateDisplay);

        // Create navigation history
        const historyDisplay = document.createElement('div');
        historyDisplay.className = 'router-history';
        historyDisplay.innerHTML = '<h4>Navigation History</h4>';
        const historyList = document.createElement('ul');
        historyDisplay.appendChild(historyList);
        content.appendChild(historyDisplay);

        // Create island state display
        const islandDisplay = document.createElement('div');
        islandDisplay.className = 'router-islands';
        islandDisplay.innerHTML = '<h4>Dynamic Islands</h4>';
        content.appendChild(islandDisplay);

        // Function to update displays
        const updateDisplays = async () => {
            try {
                const state = await routerManager.sendWorkerMessage('getState', {}) as RouterState;

                // Update current state
                stateDisplay.innerHTML = `
                    <h4>Current State</h4>
                    <div>Current Slide: ${state.currentSlide}</div>
                    ${state.currentIsland ? `<div>Current Island: ${state.currentIsland}</div>` : ''}
                `;

                // Update history
                historyList.innerHTML = state.slideHistory
                    .map((slide: string) => `<li>${slide}</li>`)
                    .join('');

                // Update islands
                const islands = Array.from(state.islandStates.entries());
                islandDisplay.innerHTML = `
                    <h4>Dynamic Islands</h4>
                    ${islands.map(([slide, islandMap]: [string, Map<string, any>]) => `
                        <div class="island-group">
                            <div class="slide-name">${slide}</div>
                            <ul>
                                ${Array.from(islandMap.entries())
                        .map(([name, value]: [string, any]) => `
                                        <li>${name}: ${value !== null ? '✓' : '✗'}</li>
                                    `)
                        .join('')}
                            </ul>
                        </div>
                    `).join('')}
                `;
            } catch (error) {
                console.error('Failed to update router debug display:', error);
            }
        };

        // Store cleanup function
        let unsubscribe: (() => void) | null = null;

        // Navigation handler with double assertion through unknown
        const navigationHandler = async (payload: EventPayload) => {
            addLog({
                type: 'navigation',
                category: 'router',
                summary: `Navigation: ${(payload as unknown as { effect: string }).effect}`,
                details: payload,
                timestamp: new Date().toISOString(),
                id: crypto.randomUUID()
            });
            await updateDisplays();
        };

        // Subscribe and store the cleanup function
        unsubscribe = await eventManager.subscribe('navigation', navigationHandler);

        // Initial update
        await updateDisplays();

        return {
            component: content,
            cleanup: () => {
                unsubscribe?.(); // Clean up the subscription if it exists
            }
        };
    }
}; 