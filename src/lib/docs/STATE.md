# State Management

YouI provides a unified state management system that intelligently handles different data sources and synchronization patterns.

## Core Concepts

-   **Multiple Backends**: Support for MongoDB, IndexedDB, HTTP APIs, and CRDT
-   **Automatic Synchronization**: Configure how data syncs between backends
-   **Smart Caching**: Automatic caching in IndexedDB when enabled
-   **Real-time Updates**: Support for real-time data through CRDT

## Basic Usage

```typescript
import { stateManager } from "@/lib/state";

// Get data (automatically uses configured backend)
const user = await stateManager.get("user");

// Update data
await stateManager.set("preferences", { theme: "dark" });

// Partial updates
await stateManager.update("user", { lastSeen: Date.now() });

// Subscribe to changes
const unsubscribe = stateManager.subscribe("chat", (messages) => {
    console.log("New messages:", messages);
});

// Later: cleanup subscription
unsubscribe();
```

## Configuration Examples

### User Data with Local Cache

```typescript
// Configuration
{
    'user': {
        primary: 'mongo',      // Store in MongoDB
        sync: ['indexeddb'],   // Sync to IndexedDB
        cache: true           // Enable caching
    }
}

// Usage
const user = await stateManager.get('user');  // Checks cache first
await stateManager.update('user', { status: 'online' });  // Updates MongoDB and cache
```

### Real-time Chat

```typescript
// Configuration
{
    'chat': {
        primary: 'crdt',     // Use CRDT for real-time
        sync: ['mongo'],     // Persist to MongoDB
        realtime: true      // Enable real-time updates
    }
}

// Usage
stateManager.subscribe('chat', (messages) => {
    renderMessages(messages);  // Updates automatically
});

await stateManager.set('chat', {
    messages: [...existing, newMessage]
});  // Syncs to all clients
```

### Local Preferences

```typescript
// Configuration
{
    'preferences': {
        primary: 'indexeddb'  // Store only locally
    }
}

// Usage
await stateManager.set('preferences', {
    theme: 'dark',
    fontSize: 14
});  // Persists in browser
```

### API Data with Caching

```typescript
// Configuration
{
    'api-data': {
        primary: 'http',     // Fetch from API
        cache: true         // Cache responses
    }
}

// Usage
const data = await stateManager.get('api-data');  // Uses cache if available
```

## Advanced Patterns

### Nested Data Structures

```typescript
// Deep updates maintain other fields
await stateManager.update("user.profile", {
    avatar: newUrl
}); // Only updates avatar

// Access nested data
const profile = await stateManager.get("user.profile");
```

### Batch Operations

```typescript
// Update multiple related pieces of state
await Promise.all([
    stateManager.update("user", { status: "offline" }),
    stateManager.update("preferences", { lastSeen: Date.now() })
]);
```

### Error Handling

```typescript
try {
    await stateManager.set("user", userData);
} catch (error) {
    // Handle specific backend errors
    if (error.backend === "mongo") {
        // Handle MongoDB error
    }
}
```

### Type Safety

```typescript
interface User {
    id: string;
    name: string;
    profile: {
        avatar: string;
    };
}

// Get with type
const user = await stateManager.get<User>("user");
if (user) {
    console.log(user.profile.avatar); // Type-safe access
}
```

## Best Practices

1. **Configure Based on Data Characteristics**

    - Use `mongo` for persistent server data
    - Use `crdt` for collaborative features
    - Use `indexeddb` for local-only data
    - Use `http` for external API data

2. **Enable Caching Strategically**

    - Cache frequently accessed data
    - Cache slow-to-fetch data
    - Don't cache rapidly changing data

3. **Use Real-time Carefully**

    - Enable for collaborative features
    - Enable for instant updates
    - Avoid for infrequently changed data

4. **Handle Errors Appropriately**
    - Always catch errors in critical operations
    - Provide fallbacks for offline scenarios
    - Log errors for debugging
