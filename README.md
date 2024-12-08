# YouI

A simple way to build complexity.

## Concepts

### Dynamic Islands

A Dynamic Island is a self-contained, independently rendered component that can be used to build data-driven UI components.

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

#### Examples

Form Field:

```html
<div class="dynamic-island">
    <header>Form Field Label</header>
    <aside></aside>
    <main><input type="text" /></main>
    <article></article>
    <footer><p>Validation Message</p></footer>
</div>
```

Button:

```html
<style>
    .dynamic-island {
        border: 1px solid;
        border-radius: 10px;

        &:hover {
            border-color: var(--color-primary);
        }
    }
</style>
<div class="dynamic-island">
    <header></header>
    <aside><span>Icon</span></aside>
    <main><span>Text</span></main>
    <article></article>
    <footer></footer>
</div>
```

## Technical Architecture

### Core Principles

1. **Self-Contained Units**: Each Dynamic Island is a fully independent unit that manages its own:

    - Data fetching and state
    - Lifecycle and rendering
    - Event handling
    - Child island composition

2. **Parallel Processing**: Leveraging Web Workers for performance:
    - State Management Worker: Handles persistence and state updates
    - Event Worker: Manages event queuing and processing
    - Route/Data Worker: Handles data prefetching and resolution

### State Management (Worker-based)

```typescript
interface StateWorker {
    storage: {
        read: () => Promise<any>;
        write: (data: any) => Promise<void>;
    };
    mutations: {
        update: (key: string, value: any) => void;
        notify: (subscribers: string[]) => void;
    };
}
```

### Component API

```typescript
const ExampleIsland = YouI({
    // Data requirements (processed in worker)
    load: {
        data: DataSource.query(),
        related: RelatedData.fetch()
    },

    // Internal state (managed in worker)
    state: {
        activeView: "default",
        isLoading: false
    },

    // Event handlers (processed in worker)
    events: {
        onChange: (value) => {},
        onSubmit: () => {}
    },

    // Composition
    island: DynamicIsland({
        header: HeaderComponent,
        aside: AsideIsland, // Nested independent island
        main: MainContent,
        article: StatsIsland, // Nested independent island
        footer: FooterActions
    })
});
```

### Implementation Strategy

1. **Phase 1: State Management Worker**

    - Implement persistence layer
    - Build state mutation system
    - Create notification mechanism

2. **Phase 2: Event System**

    - Design event queue
    - Implement subscription management
    - Build worker communication

3. **Phase 3: Data and Routing**

    - Create data resolution system
    - Implement route prefetching
    - Build caching mechanism

4. **Phase 4: Island Composition**
    - Design nested island architecture
    - Implement data flow
    - Build transition system
