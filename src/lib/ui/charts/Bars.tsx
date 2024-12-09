import { onMount } from "@/lib/lifecycle";
import { jsx } from "@/lib/template";
import * as echarts from "echarts";
import type { EChartOption } from "echarts";

interface BarsProps {
    id: string;
    completed: number;
    total: number;
}

export default ({ id, completed, total }: BarsProps) => {
    const chartRef = document.createElement("div");
    chartRef.id = id;
    chartRef.className = "chart-container";

    onMount(chartRef, () => {
        let myChart = echarts.getInstanceByDom(chartRef);
        if (!myChart) {
            myChart = echarts.init(chartRef);
        }

        const resizeObserver = new ResizeObserver(() => {
            myChart?.resize();
        });
        resizeObserver.observe(chartRef);

        const remaining = total - completed;
        const completedPercentage = Math.round((completed / total) * 100);
        const remainingPercentage = Math.round((remaining / total) * 100);

        const option: EChartOption = {
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

        myChart.setOption(option);

        return () => {
            resizeObserver.disconnect();
            myChart?.dispose();
        };
    });

    return chartRef;
};
