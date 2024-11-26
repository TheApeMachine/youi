import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { orgchart } from "@/lib/ui/orgchart/functions";
import { NodeContent } from "@/lib/ui/orgchart/NodeContent";
import { OrgChartNode } from "@/lib/ui/orgchart/types";
import * as d3 from "d3";
import { OrgChart } from "d3-org-chart";

export const render = Component({
    effect: () => {
        let chart: any;
        let dragEnabled = false;
        let dragStartX = 0;
        let dragStartY = 0;
        let isDragStarting = false;

        const { onDrag, onDragEnd } = orgchart();

        function generateContent(
            d: OrgChartNode & { width: number; height: number }
        ) {
            return NodeContent({
                data: d,
                width: d.width,
                height: d.height
            }).outerHTML;
        }

        function onDragStart(
            this: SVGGElement,
            element: SVGGElement,
            dragEvent: any
        ) {
            const width = dragEvent.subject.width;
            const half = width / 2;
            const x = dragEvent.x - half;
            dragStartX = x;
            dragStartY = parseFloat(dragEvent.y);
            isDragStarting = true;

            d3.select(element).classed("dragging", true);
        }

        // Initialize chart with animation settings
        setTimeout(() => {
            d3.csv(
                "https://raw.githubusercontent.com/bumbeishvili/sample-data/main/data-oracle.csv"
            ).then((rawData) => {
                const data = rawData as unknown as OrgChartNode[];

                try {
                    chart = new OrgChart()
                        .nodeHeight(() => 85 + 25)
                        .nodeWidth(() => 220 + 2)
                        .childrenMargin(() => 50)
                        .compactMarginBetween(() => 35)
                        .compactMarginPair(() => 30)
                        .neighbourMargin(() => 20)
                        .nodeContent(
                            (d: any, i: number, arr: any[], state: any) =>
                                generateContent(d)
                        )
                        .nodeEnter(function (this: SVGGElement, node: any) {
                            d3.select(this).call(
                                (d3.drag() as any)
                                    .filter(function (this: SVGGElement) {
                                        return (
                                            dragEnabled &&
                                            this.classList.contains("draggable")
                                        );
                                    })
                                    .on(
                                        "start",
                                        function (this: SVGGElement, d: any) {
                                            onDragStart.call(this, this, d);
                                        }
                                    )
                                    .on(
                                        "drag",
                                        function (
                                            this: SVGGElement,
                                            event: any
                                        ) {
                                            onDrag(this, event);
                                        }
                                    )
                                    .on(
                                        "end",
                                        function (
                                            this: SVGGElement,
                                            event: any
                                        ) {
                                            onDragEnd(this, event);
                                        }
                                    )
                            );
                        })
                        .nodeUpdate(function (this: SVGGElement, node: any) {
                            const element = d3.select(this);
                            element.classed(
                                "droppable",
                                !["102", "120", "124"].includes(node.data.id)
                            );
                            element.classed(
                                "draggable",
                                node.data.id !== "101"
                            );
                        })
                        // Add animation settings
                        .duration(1000)
                        .initialZoom(0.7)
                        .onNodeClick((d: any) => {
                            console.log(d);
                        })
                        .container(".chart-container")
                        .data(data)
                        .render();
                } catch (error) {
                    console.error("Error initializing org chart:", error);
                }
            });
        }, 100);
    },
    render: () => {
        const {
            enableDrag: enableDragFn,
            disableDrag: disableDragFn,
            cancelDrag: cancelDragFn,
            undo: undoFn,
            redo: redoFn
        } = orgchart();

        return (
            <div class="column grow">
                <div class="chart-controls">
                    <button
                        id="enableDragButton"
                        onclick={() => enableDragFn()}
                    >
                        Organize
                    </button>
                    <div id="dragActions" class="hide">
                        <button id="finishDrag" onclick={() => disableDragFn()}>
                            Done
                        </button>
                        <button
                            id="undoButton"
                            disabled
                            onclick={() => undoFn()}
                        >
                            Undo
                        </button>
                        <button
                            id="redoButton"
                            disabled
                            onclick={() => redoFn()}
                        >
                            Redo
                        </button>
                        <button id="cancelDrag" onclick={() => cancelDragFn()}>
                            Cancel
                        </button>
                    </div>
                </div>
                <div class="chart-container"></div>
            </div>
        );
    }
});
