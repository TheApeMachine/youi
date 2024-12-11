import { jsx } from "@/lib/template";
import { ChartConfig } from "@/lib/ui/charts/types";
import * as echarts from "echarts";
import type { EChartOption } from "echarts";

interface ChartProps {
    id: string;
    config: ChartConfig;
}

export default ({ id, config }: ChartProps) => {
    const handleMount = (element: HTMLElement) => {
        const chart = echarts.init(element);
        const isPieChart = config.series.some(series => series.type === 'pie');

        const option = {
            tooltip: {
                trigger: config.tooltip?.trigger || 'axis',
                show: config.tooltip?.show ?? true,
                formatter: config.tooltip?.formatter
            },
            grid: !isPieChart ? (config.grid || {
                show: false
            }) : undefined,
            dataset: config.datasets,
            xAxis: !isPieChart ? {
                type: config.xAxis?.type || 'category',
                name: config.xAxis?.name,
                position: config.xAxis?.position,
                show: config.xAxis?.show ?? true
            } : undefined,
            yAxis: !isPieChart ? {
                type: config.yAxis?.type || 'value',
                name: config.yAxis?.name,
                position: config.yAxis?.position,
                show: config.yAxis?.show ?? true
            } : undefined,
            series: config.series.map(series => {
                const { style, ...rest } = series;
                return {
                    ...rest,
                    smooth: style?.smooth,
                    color: style?.color,
                    areaStyle: style?.areaStyle,
                    lineStyle: style?.lineStyle,
                    label: style?.label,
                    ...(series.type === 'pie' && {
                        radius: ['0%', '75%'],
                        center: ['50%', '50%'],
                        overflow: 'break',
                        label: {
                            ...style?.label,
                            position: 'inside',
                            alignTo: 'labelLine',
                            edgeDistance: '10%'
                        },
                        labelLine: {
                            length: 10,
                            smooth: false
                        }
                    })
                };
            })
        } as EChartOption;

        if (config.theme) {
            chart.setOption({
                backgroundColor: config.theme.backgroundColor,
                textStyle: {
                    color: config.theme.textColor,
                    fontFamily: config.theme.fontFamily
                },
                color: config.theme.colors
            } as EChartOption);
        }

        const handleResize = () => {
            chart.resize();
        };

        window.addEventListener('resize', handleResize);
        chart.setOption(option);

        return () => {
            window.removeEventListener('resize', handleResize);
            chart.dispose();
        };
    };

    const classes = {
        ["chart-container"]: true,
    };

    return (
        <div id={id} className={classes} onMount={handleMount}></div>
    );
};
