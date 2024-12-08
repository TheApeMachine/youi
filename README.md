# YouI

A simple way to build complexity.

## Core Concepts

### Dynamic Islands

A Dynamic Island is a self-contained, independently rendered component that can be used to build data-driven UI components. The system is built on three core pillars:

-   worker-based routing, state, and event management,
-   event-driven updates,
-   slide-based page routing, combined with individual dynamic island routing.

In rough terms:

Given a route like `/home/profile`, we could say that there must be a slide for `/home`, and within that slide there must be a dynamic island for `/profile`.

#### Core Structure

Each Dynamic Island uses a consistent HTML structure:

```html
<style>
    .dynamic-island {
        display: grid;
        grid-template-columns: auto 1fr auto;
        grid-template-rows: auto 1fr auto;
        grid-template-areas:
            "header header header"
            "aside main article"
            "footer footer footer";
    }
</style>

<div class="dynamic-island">
    <header></header>
    <aside></aside>
    <main></main>
    <article></article>
    <footer></footer>
</div>
```

This structure and styling makes it so that any element that does not have any content will not take up any space. Dynamic Islands are designed to essentially "morph" into various component types, using the mini-grid system to lay things out.

## Technical Architecture

### Core Principles

1. **Worker-Based Architecture**: Each core system runs in its own Web Worker:

    - State Worker: Handles state persistence and updates
    - Event Worker: Manages event queuing and processing
    - Router Worker: Handles navigation and view updates

2. **Event-Driven Updates**: All system interactions are event-based:

    - DOM events through data attributes
    - State changes through worker messages
    - Navigation through slide transitions

3. **Parallel Processing**: Each worker operates independently:
    - Asynchronous state updates
    - Non-blocking event processing
    - Independent view updates

### Current Implementation Status

#### ✅ Completed Features

1. **State Management**

    - Worker-based state handling
    - Multiple backend support (IndexedDB, planned: MongoDB, HTTP, CRDT)
    - Nested state operations
    - Real-time subscriptions

2. **Event System**

    - Worker-based event processing
    - Pattern-based subscriptions
    - DOM event integration
    - Event buffering and retention

3. **Router**
    - Slide-based navigation
    - Independent island updates
    - Worker-based route handling
    - History management

#### 🚧 In Progress

1. **Data Layer**

    - Backend integrations
    - CRDT implementation
    - Caching mechanisms
    - Offline support

2. **UI Components**

    - Configuration-driven islands
    - Template system
    - Animation framework
    - Theme management

3. **Developer Tools**
    - Debug interface
    - State inspector
    - Event monitor
    - Performance tracking

### Component API

```typescript
const ExampleIsland = YouI({
    // Data requirements
    load: {
        data: DataSource.query(),
        related: RelatedData.fetch()
    },

    // State configuration
    state: {
        primary: "indexeddb",
        sync: ["mongo"],
        cache: true
    },

    // Event handlers
    events: {
        onChange: (value) => {},
        onSubmit: () => {}
    },

    // Island composition
    island: DynamicIsland({
        header: HeaderComponent,
        aside: AsideIsland,
        main: MainContent,
        article: StatsIsland,
        footer: FooterActions
    })
});
```

## Roadmap

### Phase 1: Core Systems (Current)

1. **State Management**

    - [x] Worker implementation
    - [x] IndexedDB backend
    - [ ] MongoDB integration
    - [ ] CRDT support

2. **Event System**

    - [x] Worker implementation
    - [x] Pattern matching
    - [x] DOM integration
    - [ ] Event replay

3. **Router**
    - [x] Worker implementation
    - [x] Slide transitions
    - [x] Island updates
    - [ ] Prefetching

### Phase 2: Data Layer

1. **Backend Integration**

    - [ ] REST API wrapper
    - [ ] GraphQL support
    - [ ] WebSocket integration
    - [ ] Offline first

2. **Data Sync**
    - [ ] Multi-backend sync
    - [ ] Conflict resolution
    - [ ] Change tracking
    - [ ] Migration system

### Phase 3: UI Framework

1. **Component System**

    - [ ] Template engine
    - [ ] Style system
    - [ ] Animation framework
    - [ ] Accessibility layer

2. **Developer Experience**
    - [ ] CLI tools
    - [ ] Debug tools
    - [ ] Documentation
    - [ ] Testing utilities

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
