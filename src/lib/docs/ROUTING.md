# YouI Router

A slide-based router using Reveal.js for transitions and parallel updates through Dynamic Islands.

## Core Concepts

### Slide-Based Navigation

-   Each route corresponds to a slide in Reveal.js
-   First segment of the URL determines the slide (e.g., `/` -> `home.tsx`)
-   Additional segments target specific Dynamic Islands within the slide

### Worker-Based Processing

-   Navigation and view updates are handled by a Web Worker
-   Asynchronous loading of route modules
-   Message queue system for reliable communication

### Dynamic Islands Integration

-   Slides can contain multiple Dynamic Islands
-   Islands can be updated independently
-   Parallel updates without full page reloads

## Route Structure

Routes are defined in the `src/routes` directory:

```tsx
// src/routes/home.tsx
import { DynamicIsland } from "@/lib/ui/DynamicIsland";

export default () => <DynamicIsland variant="logo" main={<MainContent />} />;
```

### URL Pattern

```plaintext
/{slide}/{island?}
```

-   `slide`: Corresponds to a route file (e.g., `home.tsx`)
-   `island`: Optional, targets a specific Dynamic Island for updates

## Navigation

### Event-Based Navigation

```typescript
// Navigate programmatically
eventManager.emit("navigate", { effect: "/home" });

// Navigate to specific island
eventManager.emit("navigate", { effect: "/home/settings" });
```

### Initialization

The router automatically:

1. Sets up Reveal.js container
2. Initializes worker communication
3. Handles initial route navigation

## Implementation Details

### Worker Communication

```typescript
// Message Types
type RouterMessage = {
    type: 'navigate' | 'updateView' | 'islandUpdated';
    payload: any;
    id: string;
};

// Navigation Flow
1. Emit navigation event
2. Worker processes path
3. Worker sends updateView message
4. Main thread updates DOM
```

### View Updates

-   Slides are created/updated dynamically
-   Components are loaded asynchronously
-   JSX is transformed and rendered
-   Dynamic Islands can be updated independently

## Error Handling

-   Retry mechanism for Reveal.js initialization
-   Graceful handling of missing routes
-   Error boundaries for component failures
-   Detailed logging for debugging

## Best Practices

1. **Route Organization**

    - Keep route files simple
    - Use Dynamic Islands for complex layouts
    - Handle loading states appropriately

2. **Navigation**

    - Use event system for navigation
    - Handle navigation errors gracefully
    - Consider slide transitions

3. **Dynamic Islands**

    - Design for parallel updates
    - Keep island state isolated
    - Handle island-specific errors

4. **Performance**
    - Lazy load route components
    - Optimize slide transitions
    - Minimize worker message size
