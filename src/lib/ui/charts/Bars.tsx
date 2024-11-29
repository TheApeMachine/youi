import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import * as echarts from "echarts";
import { EChartsOption, GraphicComponentOption } from "echarts";

export const Bars = Component({
    effect: () => {
        const chartDom = document.getElementById("bars-chart")!;
        const myChart = echarts.init(chartDom);

        let option: EChartsOption & {
            graphic: {
                elements: GraphicComponentOption[];
            };
        };

        // There should not be negative values in rawData
        const rawData = [
            [100, 302, 301, 334, 390, 330, 320],
            [320, 132, 101, 134, 90, 230, 210],
            [220, 182, 191, 234, 290, 330, 310],
            [150, 212, 201, 154, 190, 330, 410],
            [820, 832, 901, 934, 1290, 1330, 1320]
        ];

        const totalData: number[] = [];
        for (let i = 0; i < rawData[0].length; ++i) {
            let sum = 0;
            for (let j = 0; j < rawData.length; ++j) {
                sum += rawData[j][i];
            }
            totalData.push(sum);
        }

        const grid = {
            left: "10%",
            right: "10%",
            top: "10%",
            bottom: "10%",
            containLabel: true
        };

        const series: echarts.BarSeriesOption[] = [
            "Direct",
            "Mail Ad",
            "Affiliate Ad",
            "Video Ad",
            "Search Engine"
        ].map((name, sid) => {
            return {
                name,
                type: "bar",
                stack: "total",
                barWidth: "60%",
                label: {
                    show: true,
                    formatter: (params: any) =>
                        Math.round(params.value * 1000) / 10 + "%"
                },
                data: rawData[sid].map((d, did) =>
                    totalData[did] <= 0 ? 0 : d / totalData[did]
                )
            };
        });

        const color = ["#5470c6", "#91cc75", "#fac858", "#ee6666", "#73c0de"];

        option = {
            grid,
            yAxis: {
                type: "value",
                axisLabel: {
                    formatter: "{value}%"
                }
            },
            xAxis: {
                type: "category",
                data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            },
            series,
            graphic: {
                elements: []
            }
        } as typeof option;

        option && myChart.setOption(option);

        // Cleanup
        return () => {
            myChart.dispose();
        };
    },
    render: () => <div id="bars-chart" class="chart-container"></div>
});
