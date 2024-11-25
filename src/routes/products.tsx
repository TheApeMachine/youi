import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import Drawflow from "drawflow";

export const render = Component({
    effect: () => {
        const drawflow = new Drawflow(
            document.getElementById("drawflow") as HTMLElement
        );

        drawflow.start();
    },
    render: async () => <div id="drawflow"></div>
});
