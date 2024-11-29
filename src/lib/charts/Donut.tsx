import { jsx } from "@/lib/template"
import { Component } from "@/lib/ui/Component"
import * as echarts from 'echarts';
import { EChartsOption } from "echarts";

export const Donut = Component({
    effect: () => {
        const chartDom = document.getElementById('donut-chart')!;
        chartDom.style.width = "400px";
        chartDom.style.height = "400px"
        const myChart = echarts.init(chartDom);
        let option: EChartsOption;

        option = {
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '5%',
                left: 'center'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 10,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: false,
                        position: 'center'
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: 40,
                            fontWeight: 'bold'
                        }
                    },
                    labelLine: {
                        show: false
                    },
                    data: [
                        { value: 1048, name: 'Search Engine' },
                        { value: 735, name: 'Direct' },
                        { value: 580, name: 'Email' },
                        { value: 484, name: 'Union Ads' },
                        { value: 300, name: 'Video Ads' }
                    ]
                }
            ]
        };

        option && myChart.setOption(option);
    },
    render: () => (
        <div id="donut-chart" class="row center grow width height"></div>
    )
})