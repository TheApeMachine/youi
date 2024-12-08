import { DebugModuleSetup } from '../types';
import { stateManager } from '@/lib/state';
import { eventManager as eventBus } from '@/lib/event';
import { EventPayload } from '@/lib/event/types';

interface StateMetadata {
    timestamp: number;
    version: number;
}

interface StateEntry {
    key: string;
    value: any;
    metadata: StateMetadata;
}

interface StateData {
    value: any;
    metadata: StateMetadata;
}

export const setup: DebugModuleSetup = {
    name: 'State',
    description: 'Monitor state changes and subscriptions',
    setup: async ({ addLog, container }) => {
        const content = document.createElement('div');
        content.className = 'state-content';

        // Create state overview
        const stateOverview = document.createElement('div');
        stateOverview.className = 'state-overview';
        content.appendChild(stateOverview);

        // Create state history
        const stateHistory = document.createElement('div');
        stateHistory.className = 'state-history';
        stateHistory.innerHTML = '<h4>State History</h4>';
        const historyList = document.createElement('ul');
        stateHistory.appendChild(historyList);
        content.appendChild(stateHistory);

        // Create subscriptions view
        const subscriptionsView = document.createElement('div');
        subscriptionsView.className = 'state-subscriptions';
        subscriptionsView.innerHTML = '<h4>Active Subscriptions</h4>';
        content.appendChild(subscriptionsView);

        // Keep track of state history
        const history: StateEntry[] = [];
        const MAX_HISTORY = 50;

        const addToHistory = (entry: StateEntry) => {
            history.unshift(entry);
            if (history.length > MAX_HISTORY) {
                history.pop();
            }
            updateHistory();
        };

        const updateHistory = () => {
            historyList.innerHTML = history
                .map(entry => `
                    <li>
                        <div class="history-entry">
                            <span class="key">${entry.key}</span>
                            <span class="version">v${entry.metadata.version}</span>
                            <span class="time">${new Date(entry.metadata.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div class="value">${JSON.stringify(entry.value, null, 2)}</div>
                    </li>
                `)
                .join('');
        };

        // Function to update state overview
        const updateStateOverview = async () => {
            try {
                // Get current state using the public API
                const stateEntries = await stateManager.get('__state_keys__') as string[] || [];
                const states = await Promise.all(
                    stateEntries.map(async (key: string) => ({
                        key,
                        data: await stateManager.get(key)
                    }))
                );

                stateOverview.innerHTML = `
                    <h4>Current State</h4>
                    <div class="state-entries">
                        ${states.map(({ key, data }) => `
                            <div class="state-entry">
                                <div class="key">${key}</div>
                                <div class="value">${JSON.stringify(data, null, 2)}</div>
                                <div class="metadata">
                                    Updated: ${new Date().toLocaleTimeString()}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            } catch (error) {
                console.error('Failed to update state overview:', error);
            }
        };

        // Store unsubscribe function returned by subscribe
        let unsubscribe: (() => void) | null = null;

        // Update handler to match EventPayload type
        const stateChangeHandler = (payload: EventPayload) => {
            const statePayload = payload.data as { key: string; value: any; metadata: StateMetadata };
            addLog({
                type: 'state',
                category: 'state',
                summary: `State change: ${statePayload.key}`,
                details: statePayload,
                timestamp: new Date().toISOString(),
                id: crypto.randomUUID()
            });
            addToHistory({
                key: statePayload.key,
                value: statePayload.value,
                metadata: statePayload.metadata
            });
            updateStateOverview();
        };

        // Store unsubscribe function when subscribing
        const subscribeAsync = async () => {
            unsubscribe = await eventBus.subscribe('state.change', stateChangeHandler);
        };
        await subscribeAsync();

        // Initial state update
        await updateStateOverview();

        return {
            component: content,
            cleanup: () => {
                unsubscribe?.();
            }
        };
    }
}; 