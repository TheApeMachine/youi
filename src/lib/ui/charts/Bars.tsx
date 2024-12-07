import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import * as echarts from "echarts";
import { EChartsOption, GraphicComponentOption } from "echarts";

interface BarsProps {
    id: string;
    completed: number;
    total: number;
}

export const Bars = Component({
    render: ({ id }: BarsProps) => <div id={id} class="chart-container"></div>,
    effect: ({ id, completed, total }: BarsProps) => {
        const chartDom = document.getElementById(id);
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
        const completedPercentage = Math.round((completed / total) * 100);
        const remainingPercentage = Math.round((remaining / total) * 100);

        console.log("Percentages:", {
            completedPercentage,
            remainingPercentage
        });

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
                max: 100,
                min: 0
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
                    data: [completedPercentage],
                    itemStyle: {
                        color: "var(--brand-light)"
                    },
                    label: {
                        show: true,
                        position: "inside",
                        formatter: `${completedPercentage}%`
                    }
                },
                {
                    name: "Remaining",
                    type: "bar",
                    stack: "total",
                    data: [remainingPercentage],
                    itemStyle: {
                        color: "#ffffff"
                    },
                    label: {
                        show: true,
                        position: "inside",
                        formatter: `${remainingPercentage}%`
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
