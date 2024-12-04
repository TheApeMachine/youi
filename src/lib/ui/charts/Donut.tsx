import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import * as echarts from "echarts";
import { EChartsOption } from "echarts";

export const Donut = Component({
    render: () => <div id="donut-chart" class="chart-container"></div>,
    effect: () => {
        const chartDom = document.getElementById("donut-chart");
        if (!chartDom) return;

        // Only initialize if no instance exists
        let myChart = echarts.getInstanceByDom(chartDom);
        if (!myChart) {
            myChart = echarts.init(chartDom);
        }

        // Add resize observer
        const resizeObserver = new ResizeObserver(() => {
            myChart?.resize();
        });
        resizeObserver.observe(chartDom);

        // Chart configuration
        let option: EChartsOption;

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

        // Cleanup
        return () => {
            resizeObserver.disconnect();
            myChart.dispose();
        };
    }
});
