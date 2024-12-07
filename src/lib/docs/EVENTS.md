# YouI Event System

A powerful and flexible event management system that combines a global event bus with ergonomic DOM event handling and type-safe event props.

## 🚀 Getting Started

First, initialize the event management system in your application:

```ts
import { eventBus, EventManager } from "@/lib/event";

const eventManager = EventManager();
eventManager.init();
```

## 🎯 Event Bus: Subscribe & Publish

### Basic Subscription

```ts
eventBus.subscribe("stateChange", (payload) => {
    console.log("State changed:", payload);
});
```

### Conditional Subscription

```ts
// Only trigger when specific conditions are met
eventBus.subscribe(
    "stateChange",
    (payload) => {
        console.log("Login state changed:", payload);
    },
    (payload) => payload.key === "isLoggedIn"
);

// Multiple subscribers for the same event
eventBus.subscribe(
    "userAction",
    (payload) => {
        console.log("User performed action:", payload);
    },
    (payload) => payload.type === "click"
);
```

### Publishing Events

```ts
// Basic event publishing
eventBus.publish("stateChange", { key: "isLoggedIn", value: true });

// Publishing with complex payload
eventBus.publish("userAction", {
    type: "click",
    target: "submitButton",
    timestamp: Date.now(),
    data: { formId: "login-form" }
});
```

## 🖱️ DOM Event Handling

### Type-Safe Event Props

Components can receive strongly-typed event handlers through props:

```tsx
interface ButtonProps extends ComponentEventProps {
    label: string;
}

const Button = Component({
    render: (props: ButtonProps) => (
        <button onClick={props.onClick}>{props.label}</button>
    )
});

// Usage with type checking
<Button
    label="Click Me"
    onClick={(e: MouseEvent) => console.log("Clicked!", e)}
    onMouseEnter={(e: MouseEvent) => console.log("Mouse entered")}
/>;
```

### Available Event Props

The system provides type-safe handlers for common DOM events:

-   `onClick`: MouseEvent
-   `onInput`: InputEvent
-   `onChange`: Event
-   `onSubmit`: SubmitEvent
-   `onFocus`: FocusEvent
-   `onBlur`: FocusEvent
-   `onMouseEnter`: MouseEvent
-   `onMouseLeave`: MouseEvent
-   `onKeyDown`: KeyboardEvent
-   `onKeyUp`: KeyboardEvent

### Event Types

Events are categorized into different types:

```ts
type EventType =
    | "dom" // DOM events (click, input, etc.)
    | "state" // State changes
    | "route" // Navigation/routing events
    | "system" // System events (loading, error, etc.)
    | "custom"; // User-defined events
```

### Event Payloads

All events carry a standardized payload structure:

```ts
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

## 🔄 State Management Integration

The event system seamlessly integrates with the state manager:

```ts
// State changes through events
eventBus.publish("stateChange", {
    type: "state",
    topic: "theme",
    data: { mode: "dark" }
});

// Listen for specific state changes
eventBus.subscribe("stateChange", (payload) => {
    if (payload.topic === "theme") {
        console.log("Theme changed to:", payload.data.mode);
    }
});
```

## 🛠️ Best Practices

1. **Type Safety**: Use TypeScript interfaces for props and event handlers
2. **Event Categorization**: Use appropriate EventType for different kinds of events
3. **Prop Composition**: Extend ComponentEventProps for component props that need event handling
4. **Error Handling**: Event handlers are automatically wrapped in try-catch blocks
5. **Cleanup**: Event listeners are automatically managed through the component lifecycle
6. **Event Payload Structure**: Follow the standard EventPayload interface for consistency

## 🌟 Conclusion

The YouI event system provides a robust, type-safe foundation for handling both application-level events and DOM interactions. It combines the power of a publish/subscribe pattern with ergonomic, strongly-typed event handling props for components.

The system is designed to be both performant and developer-friendly, with TypeScript integration ensuring type safety throughout your application.
