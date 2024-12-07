# YouI Dynamic Island

A powerful, configuration-driven component system that can morph between different states based on JSON configurations and dynamic data sources.

## 🚀 Getting Started

Initialize a Dynamic Island in your application:

```tsx
import { DynamicIsland } from "@/components/ui/DynamicIsland";

const MyPage = () => (
    <DynamicIsland
        variant="page"
        state={{
            user: {
                primary: "mongo",
                sync: ["indexeddb"],
                cache: true
            },
            navigation: {
                primary: "indexeddb"
            }
        }}
    />
);
```

## 🏗️ Architecture

The Dynamic Island consists of five main parts that work together to create a seamless, reactive system:

1. **Core Component**: Manages the overall structure and lifecycle

    - Handles component initialization and cleanup
    - Manages component transitions
    - Coordinates between other parts

2. **Event System**: Orchestrates all interactions and updates

    - Handles user interactions (clicks, inputs, etc.)
    - Manages system events (state changes, routing, etc.)
    - Coordinates data flow between components
    - Triggers state updates and transitions

3. **State Manager**: Handles data persistence and synchronization

    - Manages data across different backends
    - Handles caching and persistence
    - Provides real-time updates
    - Syncs between different data sources

4. **Source Loader**: Handles data fetching and imports

    - Loads configuration files
    - Fetches external data
    - Manages loading states
    - Handles errors and retries

5. **Content Builder**: Constructs the DOM based on configuration
    - Builds component structure
    - Applies styles and animations
    - Handles dynamic updates
    - Manages transitions

### Data Flow

```plaintext
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Events    │ ──> │    State    │ ──> │  Content    │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │
      │                    │                   │
      └──────────────────────────────────────>│
           Direct UI Updates (Animations)
```

### Core Structure

```plaintext
<div class="dynamic-island">
    <header>...</header>
    <aside>...</aside>
    <main>...</main>
    <article>...</article>
    <footer>...</footer>
</div>
```

## 📝 Configuration

### Basic Configuration with State

```json
{
    "aside": {
        "styles": {
            "display": "flex",
            "flexDirection": "column"
        },
        "state": "navigation", // References state configuration
        "children": [
            {
                "tag": "nav",
                "source": "{{navigation}}" // Uses state data
            }
        ]
    }
}
```

### Element Configuration

```json
{
    "tag": "button",
    "text": "{{user.name}}", // References user state
    "styles": {
        "display": "flex",
        "padding": "var(--sm)"
    },
    "events": {
        "trigger": "click",
        "effects": [
            {
                "target": "ul",
                "styles": {
                    "height": "auto"
                }
            }
        ]
    }
}
```

## 🔄 Data Management

### State Configuration

```tsx
interface StateConfig {
    primary: "mongo" | "indexeddb" | "http" | "crdt";
    sync?: Array<"mongo" | "indexeddb" | "http" | "crdt">;
    cache?: boolean;
    realtime?: boolean;
}

const state = {
    user: {
        primary: "mongo",
        sync: ["indexeddb"],
        cache: true
    },
    preferences: {
        primary: "indexeddb"
    }
};
```

### Data Sources

Dynamic Islands can now use multiple data sources:

```tsx
<DynamicIsland
    state={{
        profile: {
            primary: "mongo",
            sync: ["indexeddb"],
            cache: true
        }
    }}
    sources={{
        theme: {
            import: "@/data/theme.json"
        },
        chat: {
            primary: "crdt",
            realtime: true
        }
    }}
/>
```

### Template Variables

Use double curly braces for data binding from any source:

```json
{
    "text": "{{user.profile.name}}", // From MongoDB
    "children": [
        {
            "text": "{{preferences.theme}}", // From IndexedDB
            "styles": {
                "background": "{{theme.colors.primary}}" // From JSON import
            }
        }
    ]
}
```

## 🔧 State Integration

### Reactive Updates

Dynamic Islands automatically react to state changes:

```tsx
const ChatIsland = () => (
    <DynamicIsland
        state={{
            messages: {
                primary: "crdt",
                sync: ["mongo"],
                realtime: true
            }
        }}
        render={({ messages }) => (
            <div class="messages">
                {messages.map((msg) => (
                    <Message key={msg.id} {...msg} />
                ))}
            </div>
        )}
    />
);
```

### State-Driven Animations

```json
"events": {
    "trigger": "click",
    "effects": [
        {
            "target": "ul",
            "styles": {
                "height": "{{ui.expanded ? 'auto' : '0'}}",
                "opacity": "{{ui.expanded ? '1' : '0'}}"
            }
        }
    ]
}
```

## 🛠️ Best Practices

1. **State Organization**

    - Use appropriate backends for different data types
    - Enable caching for frequently accessed data
    - Use real-time updates only when needed

2. **Performance**

    - Leverage state caching
    - Use appropriate sync strategies
    - Consider backend characteristics

3. **Maintainability**

    - Keep state configurations clear
    - Document data flow
    - Use consistent naming

4. **Data Flow**
    - Plan state synchronization carefully
    - Handle offline scenarios
    - Consider conflict resolution

## 🔍 Advanced Usage

### Nested State Management

```tsx
<DynamicIsland
    state={{
        ui: {
            primary: "indexeddb"
        },
        data: {
            primary: "mongo",
            sync: ["indexeddb"],
            cache: true,
            children: {
                profile: {
                    primary: "mongo",
                    cache: true
                },
                preferences: {
                    primary: "indexeddb"
                }
            }
        }
    }}
/>
```

### Custom State Effects

```json
"effects": [
    {
        "when": "{{ui.theme === 'dark'}}",
        "styles": {
            "background": "var(--dark-bg)",
            "color": "var(--dark-text)"
        }
    }
]
```

## 🌟 Conclusion

The Dynamic Island system combines flexible UI configuration with powerful state management. Its ability to handle multiple data sources, automatic synchronization, and reactive updates makes it ideal for building complex, data-driven interfaces.

The integration with the state management system allows for seamless data flow while maintaining the simplicity of configuration-driven development.
