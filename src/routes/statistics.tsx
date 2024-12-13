import { jsx } from "@/lib/vdom";
import { Component } from "@/lib/ui/Component";
import { Flex } from "@/lib/ui/Flex";
import { Bars } from "@/lib/ui/charts/Bars";
import { Donut } from "@/lib/ui/charts/Donut";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import * as echarts from "echarts";

gsap.registerPlugin(Draggable);

export const render = Component({
    effect: (props) => {
        const grid = document.getElementById("dashboard-grid");
        if (!grid) return;

        const cellSize = 20;
        grid.style.setProperty("--cell-size", `${cellSize}px`);

        const initDraggable = (block: HTMLElement) => {
            const handle = block.querySelector(".resize-handle") as HTMLElement;
            const chartInstance = echarts.getInstanceByDom(
                block.querySelector(".chart-container") as HTMLElement
            );

            Draggable.create(block, {
                type: "top,left",
                bounds: grid,
                onDragEnd: function () {
                    gsap.set(block, {
                        top: Math.round(block.offsetTop / cellSize) * cellSize,
                        left: Math.round(block.offsetLeft / cellSize) * cellSize
                    });
                    chartInstance?.resize();
                }
            });

            Draggable.create(handle, {
                type: "top,left",
                onPress: (e: Event) => e.stopPropagation(),
                onDrag: function (this: any) {
                    gsap.set(this.target.parentNode, {
                        width: this.x,
                        height: this.y
                    });
                    chartInstance?.resize();
                },
                onDragEnd: function () {
                    chartInstance?.resize();
                },
                liveSnap: (value: number) =>
                    Math.round(value / cellSize) * cellSize
            });

            // Add window resize handler
            const resizeObserver = new ResizeObserver(() => {
                chartInstance?.resize();
            });
            resizeObserver.observe(block);
        };

        // Add initial blocks
        const addBlock = async (ChartComponent: any) => {
            const block = document.createElement("div");
            block.classList.add("draggable");
            block.style.width = `${cellSize * 15}px`;
            block.style.height = `${cellSize * 15}px`;
            block.style.left = `${cellSize}px`;
            block.style.top = `${cellSize}px`;

            const handle = document.createElement("div");
            handle.classList.add("resize-handle");
            block.appendChild(handle);

            // Render the component properly
            const chartContainer = document.createElement("div");
            chartContainer.style.width = "100%";
            chartContainer.style.height = "100%";
            chartContainer.style.padding = "8px";

            const chart = ChartComponent({});
            const renderedChart = await chart;
            chartContainer.appendChild(renderedChart);
            block.appendChild(chartContainer);

            grid.appendChild(block);
            initDraggable(block);
        };

        // Add initial charts
        Promise.all([addBlock(Bars), addBlock(Donut)]);
    },
    render: () => (
        <Flex
            id="dashboard-grid"
            className="grid"
            direction="column"
            fullWidth
            fullHeight
        ></Flex>
    )
});
