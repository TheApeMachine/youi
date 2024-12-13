import { jsx } from "@/lib/vdom";
import { Component } from "@/lib/ui/Component";
import "@/assets/orgchart.css";
import { Graph } from "@/lib/ui/orgchart/Graph";

export const render = Component({
    render: async () => {
        return (
            <Graph />
        );
    }
});
