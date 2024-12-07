import { EventType, EventPayload, EventMessage, EventSubscription, EventConfig } from './types';

class EventWorker {
    private subscriptions = new Map<string, Set<string>>();  // topic -> subscriber IDs
    private subscribers = new Map<string, EventSubscription>();  // subscriber ID -> subscription
    private eventBuffer: EventPayload[] = [];
    private retainedEvents = new Map<string, EventPayload>();  // topic -> last event
    private config: EventConfig = {
        bufferSize: 1000,
        debounceMs: 16,  // ~1 frame
        retainedEvents: [],
        patterns: {}
    };

    constructor() {
        self.onmessage = this.handleMessage.bind(this);
        this.postResponse('ready', { success: true });
    }

    private handleMessage = async (event: MessageEvent<EventMessage>) => {
        const { type, payload, id } = event.data;

        try {
            switch (type) {
                case 'subscribe':
                    await this.handleSubscribe(payload as EventSubscription, id);
                    break;
                case 'unsubscribe':
                    await this.handleUnsubscribe(payload as EventSubscription, id);
                    break;
                case 'publish':
                    await this.handlePublish(payload as EventPayload, id);
                    break;
                default:
                    throw new Error(`Unknown message type: ${type}`);
            }
        } catch (error) {
            this.postResponse('error', {
                error: error instanceof Error ? error.message : 'Unknown error'
            }, id);
        }
    };

    private handleSubscribe = async (subscription: EventSubscription, id?: string) => {
        const { topic, pattern } = subscription;

        // Handle pattern subscriptions
        if (pattern) {
            // Store pattern subscription for matching against future events
            this.subscribers.set(subscription.id, subscription);

            // Send retained events that match the pattern
            this.retainedEvents.forEach((event, eventTopic) => {
                if (this.matchPattern(eventTopic, pattern)) {
                    this.postResponse('publish', { data: event });
                }
            });
        }
        // Handle direct topic subscriptions
        else if (topic) {
            // Get or create subscription set for topic
            const subs = this.subscriptions.get(topic) || new Set();
            subs.add(subscription.id);
            this.subscriptions.set(topic, subs);
            this.subscribers.set(subscription.id, subscription);

            // Send retained event if it exists
            const retained = this.retainedEvents.get(topic);
            if (retained) {
                this.postResponse('publish', { data: retained });
            }
        }

        this.postResponse('subscribe', { success: true }, id);
    };

    private handleUnsubscribe = async (subscription: EventSubscription, id?: string) => {
        const { id: subId, topic } = subscription;

        if (topic) {
            const subs = this.subscriptions.get(topic);
            if (subs) {
                subs.delete(subId);
                if (subs.size === 0) {
                    this.subscriptions.delete(topic);
                }
            }
        }

        this.subscribers.delete(subId);
        this.postResponse('unsubscribe', { success: true }, id);
    };

    private handlePublish = async (payload: EventPayload, id?: string) => {
        // Add to buffer and trim if needed
        this.eventBuffer.push(payload);
        if (this.eventBuffer.length > this.config.bufferSize!) {
            this.eventBuffer.shift();
        }

        // Update retained events if configured
        if (payload.topic && this.config.retainedEvents?.includes(payload.topic)) {
            this.retainedEvents.set(payload.topic, payload);
        }

        // Find direct subscribers
        const topicSubscribers = payload.topic
            ? this.subscriptions.get(payload.topic)
            : new Set<string>();

        // Find pattern subscribers
        const patternSubscribers = new Set<string>();
        if (payload.topic) {
            this.subscribers.forEach((sub, id) => {
                if (sub.pattern && this.matchPattern(payload.topic!, sub.pattern)) {
                    patternSubscribers.add(id);
                }
            });
        }

        // Notify all subscribers
        const allSubscribers = new Set([...topicSubscribers || [], ...patternSubscribers]);
        allSubscribers.forEach(subId => {
            const subscription = this.subscribers.get(subId);
            if (subscription) {
                this.postResponse('publish', {
                    data: this.transformEvent(payload, subscription)
                });
            }
        });

        this.postResponse('publish', { success: true }, id);
    };

    private matchPattern(topic: string, pattern: string): boolean {
        // Convert pattern to regex
        const regexPattern = pattern
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexPattern}$`).test(topic);
    }

    private transformEvent(event: EventPayload, subscription: EventSubscription): EventPayload {
        // Apply any configured transformations
        const pattern = this.config.patterns?.[subscription.pattern || ''];
        if (pattern?.transform) {
            return pattern.transform(event);
        }
        return event;
    }

    private postResponse(type: string, payload: any, id?: string) {
        self.postMessage({ type, payload, id });
    }
}

// Initialize the worker
new EventWorker(); 