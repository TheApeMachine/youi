import { DebugModuleSetup } from '../types';
import { eventManager } from '@/lib/event';
import { EventPayload } from '@/lib/event/types';

interface EventEntry {
    topic: string;
    effect?: string;
    trigger?: string;
    timestamp: number;
    meta?: {
        source: string;
        target?: string;
        path?: string[];
    };
    data?: any;
}

export const setup: DebugModuleSetup = {
    name: 'Events',
    description: 'Monitor event system activity',
    setup: async ({ addLog, container }) => {
        const section = document.createElement('div');
        section.className = 'debug-section events';

        // Create event stream view
        const eventStream = document.createElement('div');
        eventStream.className = 'event-stream';
        eventStream.innerHTML = '<h4>Event Stream</h4>';
        const streamList = document.createElement('ul');
        eventStream.appendChild(streamList);
        section.appendChild(eventStream);

        // Create active subscriptions view
        const subscriptionsView = document.createElement('div');
        subscriptionsView.className = 'event-subscriptions';
        subscriptionsView.innerHTML = '<h4>Active Subscriptions</h4>';
        const subscriptionsList = document.createElement('ul');
        subscriptionsView.appendChild(subscriptionsList);
        section.appendChild(subscriptionsView);

        // Create event patterns view
        const patternsView = document.createElement('div');
        patternsView.className = 'event-patterns';
        patternsView.innerHTML = '<h4>Event Patterns</h4>';
        section.appendChild(patternsView);

        // Keep track of events
        const events: EventEntry[] = [];
        const MAX_EVENTS = 100;
        const activeSubscriptions = new Set<string>();

        const addEvent = (entry: EventEntry) => {
            events.unshift(entry);
            if (events.length > MAX_EVENTS) {
                events.pop();
            }
            updateEventStream();
        };

        const updateEventStream = () => {
            streamList.innerHTML = events
                .map(event => `
                    <li class="event-entry">
                        <div class="event-header">
                            <span class="topic">${event.topic}</span>
                            ${event.meta?.source ? `<span class="source">from: ${event.meta.source}</span>` : ''}
                            <span class="time">${new Date(event.timestamp).toLocaleTimeString()}</span>
                        </div>
                        ${event.effect ? `<div class="effect">Effect: ${event.effect}</div>` : ''}
                        ${event.trigger ? `<div class="trigger">Trigger: ${event.trigger}</div>` : ''}
                        ${event.meta?.target ? `<div class="target">Target: ${event.meta.target}</div>` : ''}
                        ${event.data ? `
                            <div class="data">
                                <pre>${JSON.stringify(event.data, null, 2)}</pre>
                            </div>
                        ` : ''}
                    </li>
                `)
                .join('');
        };

        const updateSubscriptions = () => {
            subscriptionsList.innerHTML = Array.from(activeSubscriptions)
                .map(topic => `
                    <li class="subscription-entry">
                        <span class="topic">${topic}</span>
                    </li>
                `)
                .join('');
        };

        // Event handler for all events
        const eventHandler = (event: EventPayload) => {
            addLog({
                type: 'event',
                category: 'events',
                summary: `Event: ${event.topic ?? 'global'}`,
                details: event,
                timestamp: new Date().toISOString(),
                id: crypto.randomUUID()
            });

            addEvent({
                topic: event.topic ?? '',
                effect: event.effect,
                trigger: event.trigger,
                timestamp: event.meta?.timestamp ?? Date.now(),
                meta: event.meta,
                data: event.data
            });

            // Track active topics
            if (event.topic) {
                activeSubscriptions.add(event.topic);
                updateSubscriptions();
            }
        };

        // Subscribe to all events using pattern matching
        const cleanup = eventManager.subscribePattern('*', eventHandler);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .debug-section.events {
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
            }
            .event-stream, .event-subscriptions, .event-patterns {
                margin-bottom: 15px;
            }
            .event-entry {
                margin: 5px 0;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
                background: #f8f8f8;
            }
            .event-header {
                display: flex;
                gap: 10px;
                margin-bottom: 5px;
            }
            .topic {
                font-weight: bold;
                color: #0066cc;
            }
            .source {
                color: #666;
                font-style: italic;
            }
            .time {
                color: #999;
                margin-left: auto;
            }
            .effect, .trigger, .target {
                font-size: 11px;
                color: #666;
                margin: 2px 0;
            }
            .data {
                margin-top: 5px;
                padding: 5px;
                background: #fff;
                border-radius: 2px;
                overflow-x: auto;
            }
            .data pre {
                margin: 0;
                white-space: pre-wrap;
            }
            .subscription-entry {
                padding: 4px 8px;
                border: 1px solid #eee;
                border-radius: 4px;
                margin: 2px 0;
            }
            ul {
                list-style: none;
                padding: 0;
                margin: 0;
                max-height: 300px;
                overflow-y: auto;
            }
        `;
        document.head.appendChild(style);

        return {
            component: section,
            cleanup: () => {
                // Cleanup subscription
                cleanup();
                style.remove();
            }
        };
    }
}; 