import { DebugModuleSetup } from '../types';
import { eventManager } from '@/lib/event';
import { EventPayload } from '@/lib/event/types';

interface EventActivity {
    timestamp: number;
    type: 'subscribe' | 'unsubscribe' | 'publish' | 'receive';
    channel: string;
    data?: any;
}

export const setup: DebugModuleSetup = {
    name: 'Events',
    description: 'Monitor event system activity',
    setup: async ({ addLog, container }) => {
        const content = document.createElement('div');
        content.className = 'events-content';

        // Create subscriptions view
        const subscriptionsView = document.createElement('div');
        subscriptionsView.className = 'event-subscriptions';
        subscriptionsView.innerHTML = '<h4>Active Subscriptions</h4>';
        const subscriptionsList = document.createElement('ul');
        subscriptionsView.appendChild(subscriptionsList);

        // Create event activity view
        const activityView = document.createElement('div');
        activityView.className = 'event-activity';
        activityView.innerHTML = '<h4>Event Activity</h4>';
        const activityList = document.createElement('ul');
        activityView.appendChild(activityList);

        // Track event system state
        const activeSubscriptions = new Map<string, number>();
        const activityLog: EventActivity[] = [];

        const updateSubscriptionsView = () => {
            subscriptionsList.innerHTML = Array.from(activeSubscriptions.entries())
                .map(([channel, count]) => `
                    <li class="subscription-entry">
                        <span class="channel">${channel}</span>
                        <span class="count">${count} listener${count !== 1 ? 's' : ''}</span>
                    </li>
                `)
                .join('');
        };

        const updateActivityView = () => {
            activityList.innerHTML = activityLog
                .slice(0, 100)  // Keep last 100 activities
                .map(activity => `
                    <li class="activity-entry ${activity.type}">
                        <div class="activity-header">
                            <span class="type">${activity.type}</span>
                            <span class="channel">${activity.channel}</span>
                            <span class="time">${new Date(activity.timestamp).toLocaleTimeString()}</span>
                        </div>
                        ${activity.data ? `
                            <div class="data">
                                <pre>${JSON.stringify(activity.data, null, 2)}</pre>
                            </div>
                        ` : ''}
                    </li>
                `)
                .join('');
        };

        const logActivity = (activity: EventActivity) => {
            activityLog.unshift(activity);
            if (activityLog.length > 1000) activityLog.pop();
            updateActivityView();
        };

        // Monkey patch the event manager to track activity
        const originalSubscribe = eventManager.subscribe;
        eventManager.subscribe = async (topic: string, handler: (payload: EventPayload) => void) => {
            const cleanup = await originalSubscribe.call(eventManager, topic, handler);

            activeSubscriptions.set(topic, (activeSubscriptions.get(topic) ?? 0) + 1);
            updateSubscriptionsView();

            logActivity({
                timestamp: Date.now(),
                type: 'subscribe',
                channel: topic
            });

            return () => {
                cleanup();
                const count = activeSubscriptions.get(topic) ?? 0;
                if (count <= 1) {
                    activeSubscriptions.delete(topic);
                } else {
                    activeSubscriptions.set(topic, count - 1);
                }
                updateSubscriptionsView();

                logActivity({
                    timestamp: Date.now(),
                    type: 'unsubscribe',
                    channel: topic
                });
            };
        };

        const originalPublish = eventManager.publish;
        eventManager.publish = async (type: string, topic: string, data: any) => {
            logActivity({
                timestamp: Date.now(),
                type: 'publish',
                channel: topic,
                data: data
            });
            return originalPublish.call(eventManager, type, topic, data);
        };

        content.appendChild(subscriptionsView);
        content.appendChild(activityView);

        return {
            component: content,
            cleanup: () => {
                eventManager.subscribe = originalSubscribe;
                eventManager.publish = originalPublish;
            }
        };
    }
}; 