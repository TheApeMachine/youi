import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { orgchart } from "@/lib/ui/orgchart/functions";
import "@/assets/orgchart.css";

export const render = Component({
    render: async () => {
        const oc = await orgchart();
        return (
            <div class="wrapper">
                <div class="chart-container"></div>
            </div>
        );
    }
});
