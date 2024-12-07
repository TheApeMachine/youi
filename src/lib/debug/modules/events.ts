import { DebugModuleSetup, DebugModuleContext } from '../types';
import { createJsonViewer } from '../jsonview';
import { eventBus, EventPayload } from '@/lib/event';

export const setup: DebugModuleSetup = {
    name: 'Events',
    description: 'Monitor and inspect framework events',
    setup: async (context: DebugModuleContext) => {
        const section = document.createElement('div');
        section.className = 'debug-section events';

        let events: Array<{
            id: string;
            timestamp: string;
            type: string;
            topic: string;
            payload: any;
        }> = [];
        let expandedEntries = new Set<string>();
        let paused = false;

        // Create controls
        const controls = document.createElement('div');
        controls.className = 'debug-section-controls';
        controls.innerHTML = `
            <button class="debug-button pause-button">
                <span class="material-symbols-rounded">pause</span>
            </button>
            <button class="debug-button clear-button">
                <span class="material-symbols-rounded">clear_all</span>
            </button>
            <div class="event-filters">
                <select class="type-filter">
                    <option value="">All Types</option>
                    <option value="dom">DOM</option>
                    <option value="state">State</option>
                    <option value="route">Route</option>
                    <option value="system">System</option>
                    <option value="custom">Custom</option>
                </select>
            </div>
        `;
        section.appendChild(controls);

        // Create events container
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'events-container';
        section.appendChild(eventsContainer);

        const updateDisplay = () => {
            const typeFilter = (controls.querySelector('.type-filter') as HTMLSelectElement).value;
            
            const filteredEvents = events
                .filter(event => !typeFilter || event.type === typeFilter);

            const html = filteredEvents.map(event => {
                const time = event.timestamp.split('T')[1].split('.')[0];
                const isExpanded = expandedEntries.has(event.id);

                return `
                    <div class="debug-entry">
                        <div class="debug-entry-header" data-id="${event.id}">
                            <span class="debug-timestamp">[${time}]</span>
                            <span class="debug-category" data-type="${event.type}">${event.type}</span>
                            <span class="debug-topic">${event.topic || ''}</span>
                        </div>
                        ${isExpanded ? `
                            <div class="debug-details">
                                <div class="debug-json" data-json='${JSON.stringify(event.payload)}'></div>
                            </div>
                        ` : ''}
                    </div>
                `;
            }).join('');

            eventsContainer.innerHTML = html;

            // Initialize JSON viewers
            eventsContainer.querySelectorAll('.debug-json').forEach(jsonContainer => {
                const jsonData = JSON.parse(jsonContainer.getAttribute('data-json') ?? '{}');
                createJsonViewer(jsonData, {
                    initialExpandDepth: 1,
                    showTypes: true,
                    theme: 'dark'
                })(jsonContainer as HTMLElement);
            });
        };

        // Event handlers
        controls.querySelector('.pause-button')?.addEventListener('click', (e) => {
            paused = !paused;
            const button = e.target as HTMLElement;
            button.textContent = paused ? 'play_arrow' : 'pause';
        });

        controls.querySelector('.clear-button')?.addEventListener('click', () => {
            events = [];
            updateDisplay();
        });

        controls.querySelector('.type-filter')?.addEventListener('change', () => {
            updateDisplay();
        });

        eventsContainer.addEventListener('click', (e) => {
            const header = (e.target as Element).closest('.debug-entry-header');
            if (header) {
                const id = header.getAttribute('data-id');
                if (id) {
                    if (expandedEntries.has(id)) {
                        expandedEntries.delete(id);
                    } else {
                        expandedEntries.add(id);
                    }
                    updateDisplay();
                }
            }
        });

        // Subscribe to events
        const handleEvent = (payload: EventPayload) => {
            if (paused) return;

            events.unshift({
                id: Math.random().toString(36).slice(2),
                timestamp: new Date().toISOString(),
                type: payload.type,
                topic: payload.topic || '',
                payload
            });

            if (events.length > 100) events.pop();
            updateDisplay();
        };

        // Subscribe to all event types
        const eventTypes = ['dom', 'state', 'route', 'system', 'custom'];
        const subscriptions = eventTypes.map(type => 
            eventBus.subscribe(type, handleEvent)
        );

        return {
            component: section,
            cleanup: () => {
                subscriptions.forEach(sub => sub.unsubscribe());
                events = [];
                expandedEntries.clear();
            }
        };
    }
}; 