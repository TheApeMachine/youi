import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import * as echarts from "echarts";
import { EChartsOption, GraphicComponentOption } from "echarts";

interface BarsProps {
    completed: number;
    total: number;
}

export const Bars = Component({
    render: (props: BarsProps) => (
        <div
            id="bars-chart"
            class="chart-container"
            style="height: 60px; width: 100%;"
        ></div>
    ),
    effect: ({ completed, total }: BarsProps) => {
        const chartDom = document.getElementById("bars-chart");
        if (!chartDom) return;

        let myChart = echarts.getInstanceByDom(chartDom);
        if (!myChart) {
            myChart = echarts.init(chartDom);
        }

        const resizeObserver = new ResizeObserver(() => {
            myChart?.resize();
        });
        resizeObserver.observe(chartDom);

        const remaining = total - completed;

        const option: EChartsOption = {
            grid: {
                left: "3%",
                right: "3%",
                top: "20%",
                bottom: "20%",
                containLabel: true
            },
            xAxis: {
                type: "value",
                show: false,
                max: total
            },
            yAxis: {
                type: "category",
                show: false,
                data: ["Respondents"]
            },
            series: [
                {
                    name: "Completed",
                    type: "bar",
                    stack: "total",
                    data: [completed],
                    itemStyle: {
                        color: "var(--brand-light)"
                    },
                    label: {
                        show: true,
                        position: "inside",
                        formatter: `${completed}/${total}`
                    }
                },
                {
                    name: "Remaining",
                    type: "bar",
                    stack: "total",
                    data: [remaining],
                    itemStyle: {
                        color: "var(--muted)"
                    }
                }
            ]
        };

        option && myChart.setOption(option);

        return () => {
            resizeObserver.disconnect();
            myChart.dispose();
        };
    }
});
