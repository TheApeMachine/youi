import { onMount } from "@/lib/lifecycle";
import { jsx } from "@/lib/template";
import * as echarts from "echarts";
import type { PieSeriesOption } from "echarts/charts";
import type { EChartsOption } from "echarts";

export default () => {
    const chartRef = document.createElement("div");
    chartRef.id = "donut-chart";
    chartRef.className = "chart-container";

    onMount(chartRef, () => {
        // Only initialize if no instance exists
        let myChart = echarts.getInstanceByDom(chartRef);
        if (!myChart) {
            myChart = echarts.init(chartRef);
        }

        // Add resize observer
        const resizeObserver = new ResizeObserver(() => {
            myChart?.resize();
        });
        resizeObserver.observe(chartRef);

        // Chart configuration
        let option: EChartsOption & { series: PieSeriesOption[] };

        option = {
            tooltip: {
                trigger: "item"
            },

            series: [
                {
                    name: "Access From",
                    type: "pie",
                    radius: ["40%", "70%"],
                    center: ["50%", "50%"],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: "#fff",
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: "center"
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: "14%",
                            fontWeight: "bold"
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: 1048, name: "Search Engine" },
                        { value: 735, name: "Direct" },
                        { value: 580, name: "Email" },
                        { value: 484, name: "Union Ads" },
                        { value: 300, name: "Video Ads" }
                    ]
                }
            ]
        };

        option && myChart.setOption(option);

        return () => {
            resizeObserver.disconnect();
            myChart?.dispose();
        };
    });

    return chartRef;
};
