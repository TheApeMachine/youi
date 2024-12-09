# YouI Dynamic Island

A powerful, configuration-driven component system that can morph between different component types.

It uses a css grid layout that makes it such that empty elements of the dynamic island take up 0 space, making those parts effectively hidden.

```css
.dynamic-island {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-rows: auto 1fr auto;
    grid-template-areas:
        "header header header"
        "aside main article"
        "footer footer footer";
    width: 100%;
    height: 100%;

    >header {
        grid-area: header;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    >aside {
        grid-area: aside;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    >main {
        grid-area: main;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    >article {
        grid-area: article;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    >footer {
        grid-area: footer;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}
```

A very simple example of a button type.

```js
<style>
    .dynamic-island {
        border: 1px solid #000000;

        main {
            padding: 1rem;

            &:hover {
                background: #FFFFFF;
            }
        }
    }
</style>
<div class="dynamic-island">
    <header></header>
    <aside></aside>
    <main>Button Text</main>
    <article></article>
    <footer></footer>
</div>
```

A very simple example of a modal type.

```js
<style>
    .dynamic-island {
        border: 1px solid #000000;
    }
</style>
<div class="dynamic-island">
    <header>Modal Title</header>
    <aside></aside>
    <main>Body Text</main>
    <article></article>
    <footer><button>Some Button</button</footer>
</div>
```

By using Flip animation, we would be able to morph from one type into another.