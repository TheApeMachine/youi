import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface DynamicIslandProps {
    header?: any;
    aside?: any;
    main?: any;
    article?: any;
    footer?: any;
}

export const DynamicIsland = Component({
    render: async (props: DynamicIslandProps) => {
        return (
            <div class="dynamic-island">
                <header>{props.header || ""}</header>
                <aside>{props.aside || ""}</aside>
                <main>{props.main || ""}</main>
                <article>{props.article || ""}</article>
                <footer>{props.footer || ""}</footer>
            </div>
        );
    }
});
