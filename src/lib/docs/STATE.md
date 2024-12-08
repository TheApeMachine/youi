# State Management

YouI uses a worker-based state management system with support for multiple backends and real-time updates.

## Core Concepts

### Worker-Based Processing

-   State operations handled in a dedicated Web Worker
-   Asynchronous state updates and reads
-   Message queue system for reliable communication

### Multiple Backends

-   **IndexedDB**: Local persistence using localforage
-   **MongoDB**: Server-side persistence
-   **HTTP**: REST API integration
-   **CRDT**: Real-time collaborative state

### State Configuration

```typescript
interface StateConfig {
    primary?: "mongo" | "indexeddb" | "http" | "crdt";
    sync?: Array<"mongo" | "indexeddb" | "http" | "crdt">;
    cache?: boolean;
    realtime?: boolean;
}
```

## Basic Usage

```typescript
import { stateManager } from "@/lib/state";

// Initialize state manager
await stateManager.init();

// Read state
const value = await stateManager.get<T>("key");

// Write state
await stateManager.set("key", value);

// Update state (merge for objects)
await stateManager.update("key", partialValue);

// Subscribe to changes
const unsubscribe = stateManager.subscribe("key", (value) => {
    console.log("State updated:", value);
});

// Cleanup subscription
unsubscribe();
```

## Backend Configuration

### Local Storage with MongoDB Sync

```typescript
{
    'preferences': {
        primary: 'indexeddb',
        sync: ['mongo'],
        cache: true
    }
}
```

### Real-time Collaborative Data

```typescript
{
    'document': {
        primary: 'crdt',
        sync: ['mongo'],
        realtime: true
    }
}
```

### API Integration with Caching

```typescript
{
    'api-data': {
        primary: 'http',
        cache: true
    }
}
```

## Implementation Details

### State Structure

```typescript
interface StateData {
    value: any;
    timestamp: number;
    version: number;
}

// Worker message types
type MessageType = "read" | "write" | "update" | "notify";
```

### Backend Interface

```typescript
interface StateBackend {
    get: <T>(key: string) => Promise<T | undefined>;
    set: (key: string, value: any) => Promise<void>;
    update: (key: string, value: any) => Promise<void>;
    subscribe?: (key: string, callback: (value: any) => void) => () => void;
}
```

### Nested State Support

```typescript
// Update nested state
await stateManager.set("user.profile.avatar", newUrl);

// Read nested state
const avatar = await stateManager.get("user.profile.avatar");
```

### Error Handling

```typescript
try {
    await stateManager.set("key", value);
} catch (error) {
    console.error("State operation failed:", error);
}
```

## Best Practices

1. **Backend Selection**

    - Use IndexedDB for local-only data
    - Use MongoDB for server persistence
    - Use CRDT for real-time collaboration
    - Use HTTP for API integration

2. **State Organization**

    - Use dot notation for nested state
    - Keep state structures flat when possible
    - Use descriptive key names

3. **Performance**

    - Enable caching for frequently accessed data
    - Subscribe only to needed state
    - Clean up subscriptions when done

4. **Error Handling**

    - Handle backend-specific errors
    - Provide fallback values
    - Log operation failures

5. **Type Safety**

    - Use TypeScript generics with get
    - Define state interfaces
    - Validate state updates
