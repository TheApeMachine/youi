# Event System

YouI uses a powerful worker-based event system that combines a global event bus with DOM event handling and type-safe event payloads. The system runs in a dedicated Web Worker for performance and reliability.

## Core Concepts

### Worker-Based Architecture

-   Events processed in a dedicated Web Worker
-   Message queue system for reliable delivery
-   Pattern-based subscription support
-   Event buffering and retention capabilities

### Event Types

```typescript
type EventType =
    | "dom" // DOM events (click, input, etc.)
    | "state" // State changes
    | "route" // Navigation/routing events
    | "system" // System events (loading, error, etc.)
    | "custom"; // User-defined events
```

### Event Payloads

All events carry a standardized payload structure:

```typescript
interface EventPayload {
    type: EventType;
    topic?: string;
    effect?: string;
    trigger?: string;
    data?: any;
    meta?: {
        timestamp: number;
        source: string;
        target?: string;
        path?: string[];
        originalEvent?: Event;
    };
}
```

## Usage

### Basic Event Subscription

```typescript
import { eventBus } from "@/lib/event";

// Subscribe to specific events
eventBus.subscribe("stateChange", (payload) => {
    console.log("State changed:", payload);
});

// Pattern-based subscription
eventBus.subscribePattern("state.*", (payload) => {
    console.log("State event:", payload);
});
```

### Publishing Events

```typescript
// Basic event publishing
eventBus.publish("stateChange", {
    type: "state",
    data: { key: "theme", value: "dark" }
});

// DOM event with effect
eventBus.publish("click", {
    type: "dom",
    effect: "submenu",
    trigger: "click",
    meta: {
        source: "navigation",
        originalEvent: event
    }
});
```

### DOM Event Integration

The event system automatically handles DOM events through data attributes:

```html
<button data-trigger="click" data-event="menu" data-effect="submenu">
    Menu
</button>
```

### System Events

Built-in system events for common operations:

-   `navigate`: Handle route changes
-   `status`: Display toast notifications
-   `system`: System-level operations

```typescript
// Navigation example
eventBus.publish("navigate", {
    type: "route",
    effect: "/dashboard"
});

// Status notification
eventBus.publish("status", {
    type: "system",
    data: {
        variant: "success",
        title: "Success",
        message: "Operation completed"
    }
});
```

## Best Practices

1. **Event Naming**

    - Use descriptive topic names
    - Follow the pattern `category.action` for hierarchical events
    - Keep names consistent across the application

2. **Payload Design**

    - Include only necessary data
    - Use typed payloads when possible
    - Include source and target information for debugging

3. **Subscription Management**

    - Clean up subscriptions when components unmount
    - Use pattern matching for related events
    - Handle errors in event callbacks

4. **Performance**

    - Use pattern subscriptions sparingly
    - Avoid heavy processing in event callbacks
    - Consider debouncing frequent events

5. **Debugging**
    - Enable debug mode for event logging
    - Use meta information for tracing
    - Monitor event patterns for optimization

## Debug Tools

The event system includes built-in debugging capabilities:

-   Event stream monitoring
-   Active subscription tracking
-   Pattern matching visualization
-   Performance metrics

Enable debug mode to access these tools:

```typescript
import { eventManager } from "@/lib/event";

eventManager.init({ debug: true });
```

## Error Handling

The event system includes robust error handling:

```typescript
try {
    eventBus.publish("criticalOperation", {
        type: "system",
        data: operationData
    });
} catch (error) {
    eventBus.publish("status", {
        type: "system",
        data: {
            variant: "error",
            title: "Error",
            message: error.message
        }
    });
}
```

## Integration with State Management

The event system seamlessly integrates with the state manager:

```typescript
// Listen for state changes
eventBus.subscribe("stateChange", (payload) => {
    if (payload.topic === "theme") {
        updateTheme(payload.data);
    }
});

// Update state through events
eventBus.publish("stateChange", {
    type: "state",
    topic: "theme",
    data: { mode: "dark" }
});
```
