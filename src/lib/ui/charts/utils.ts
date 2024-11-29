import { GraphicComponentOption, EChartsOption } from "echarts";
import * as echarts from "echarts";

export const updateChartDimensions = (
    myChart: echarts.ECharts,
    rawData: number[][],
    totalData: number[],
    series: string[],
    color: string[],
    option: EChartsOption
) => {
    const gridWidth = myChart.getWidth() - myChart.getWidth() * 0.2; // Account for left and right margins
    const gridHeight = myChart.getHeight() - myChart.getHeight() * 0.2; // Account for top and bottom margins
    const categoryWidth = gridWidth / rawData[0].length;
    const barWidth = categoryWidth * 0.6;
    const barPadding = (categoryWidth - barWidth) / 2;

    const elements: GraphicComponentOption[] = [];
    for (let j = 1, jlen = rawData[0].length; j < jlen; ++j) {
        const leftX =
            myChart.getWidth() * 0.1 + categoryWidth * j - barPadding;
        const rightX = leftX + barPadding * 2;
        let leftY = myChart.getHeight() * 0.9;
        let rightY = leftY;

        for (let i = 0, len = series.length; i < len; ++i) {
            const points = [];
            const leftBarHeight =
                (rawData[i][j - 1] / totalData[j - 1]) * gridHeight;
            points.push([leftX, leftY]);
            points.push([leftX, leftY - leftBarHeight]);
            const rightBarHeight =
                (rawData[i][j] / totalData[j]) * gridHeight;
            points.push([rightX, rightY - rightBarHeight]);
            points.push([rightX, rightY]);
            points.push([leftX, leftY]);

            leftY -= leftBarHeight;
            rightY -= rightBarHeight;

            elements.push({
                type: "polygon",
                shape: { points },
                style: {
                    fill: color[i],
                    opacity: 0.25
                }
            });
        }
    }

    option.graphic!.elements = elements;
    myChart.setOption(option);
}