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
        const section = document.createElement('div');
        section.className = 'debug-section state';

        // Create state overview
        const stateOverview = document.createElement('div');
        stateOverview.className = 'state-overview';
        section.appendChild(stateOverview);

        // Create state history
        const stateHistory = document.createElement('div');
        stateHistory.className = 'state-history';
        stateHistory.innerHTML = '<h4>State History</h4>';
        const historyList = document.createElement('ul');
        stateHistory.appendChild(historyList);
        section.appendChild(stateHistory);

        // Create subscriptions view
        const subscriptionsView = document.createElement('div');
        subscriptionsView.className = 'state-subscriptions';
        subscriptionsView.innerHTML = '<h4>Active Subscriptions</h4>';
        section.appendChild(subscriptionsView);

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
                // Get all registered state keys
                const keys = Object.keys(stateManager.registry);
                const states = await Promise.all(
                    keys.map(async (key: string) => ({
                        key,
                        data: await stateManager.getState(key)
                    }))
                );

                stateOverview.innerHTML = `
                    <h4>Current State</h4>
                    <div class="state-entries">
                        ${states.map(({ key, data }: { key: string; data: any }) => `
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
        unsubscribe = eventBus.subscribe('stateChange', stateChangeHandler);

        // Initial state update
        await updateStateOverview();

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .debug-section.state {
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
            }
            .state-overview, .state-history, .state-subscriptions {
                margin-bottom: 15px;
            }
            .state-entries {
                max-height: 200px;
                overflow-y: auto;
            }
            .state-entry {
                margin: 5px 0;
                padding: 5px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
            .state-entry .key {
                font-weight: bold;
                color: #0066cc;
            }
            .state-entry .value {
                white-space: pre-wrap;
                margin: 5px 0;
                padding: 5px;
                background: #f5f5f5;
                border-radius: 2px;
            }
            .state-entry .metadata {
                font-size: 10px;
                color: #666;
            }
            .history-entry {
                display: flex;
                gap: 10px;
                align-items: center;
            }
            .history-entry .version {
                color: #666;
            }
            .history-entry .time {
                color: #999;
            }
            ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            li {
                margin: 5px 0;
                padding: 5px;
                border: 1px solid #eee;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);

        return {
            component: section,
            cleanup: () => {
                unsubscribe?.();  // Call unsubscribe function if it exists
                style.remove();
            }
        };
    }
}; 