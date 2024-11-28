import * as echarts from 'echarts';

export const stats = () => {

    const binNumericData = (data: number[]) => {
        const min = Math.min(...data);
        const max = Math.max(...data);
        const binCount = 10;
        const binSize = (max - min) / binCount;

        const bins = Array.from({ length: binCount }, (_, i) => ({
            range: `${(min + i * binSize).toFixed(2)} - ${(min + (i + 1) * binSize).toFixed(2)}`,
            count: 0,
        }));

        data.forEach(value => {
            const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1);
            bins[binIndex].count++;
        });

        return bins.map(bin => ({
            label: bin.range,
            value: bin.count,
        }));
    }

    const binDatetimeData = (data: Date[]) => {
        const binnedData = data.reduce((acc, date) => {
            const year = date.getFullYear();
            if (!acc[year]) acc[year] = 0;
            acc[year]++;
            return acc;
        }, {} as Record<string, number>);

        return Object.keys(binnedData).map(year => ({
            label: year,
            value: binnedData[year],
        }));
    }

    const binStringData = (data: string[]) => {
        const frequency = data.reduce((acc, value) => {
            if (!acc[value]) acc[value] = 0;
            acc[value]++;
            return acc;
        }, {} as Record<string, number>);

        const sortedKeys = Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a]);

        return sortedKeys.map(key => ({
            label: key,
            value: frequency[key],
        }));
    }

    const determineColumnType = (columnData: any[]) => {
        const nonNullData = columnData.filter(value => value !== null && value !== undefined);
        if (nonNullData.every(value => typeof value === 'number')) return 'number';
        if (nonNullData.every(value => typeof value === 'boolean')) return 'boolean';
        if (nonNullData.every(value => typeof value === 'string' && isValidDate(value))) return 'datetime';
        return 'string';
    }

    const isValidDate = (dateString: string) => {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    const calculateSummaryStatsForColumn = (columnData: any[], columnType: string) => {
        switch (columnType) {
            case 'number':
                const numericData = columnData.filter((value) => typeof value === 'number' && !isNaN(value));
                if (numericData.length === 0) return { min: 0, max: 0, mean: 0 };

                const min = Math.min(...numericData);
                const max = Math.max(...numericData);
                const mean = numericData.reduce((sum, value) => sum + value, 0) / numericData.length;

                return { min, max, mean };

            case 'string':
                const uniqueValues = Array.from(new Set(columnData));
                const sortedValues = [...uniqueValues].sort((a: string, b: string) =>
                    columnData.filter(v => v === b).length - columnData.filter(v => v === a).length
                );
                const mostCommonValue = sortedValues[0];

                return { mode: mostCommonValue, uniqueCount: uniqueValues.length, totalCount: columnData.length };

            case 'boolean':
                const trueCount = columnData.filter(value => value === true).length;
                const falseCount = columnData.filter(value => value === false).length;

                return { trueCount, falseCount, totalCount: columnData.length };

            case 'datetime':
                const dateData = columnData
                    .map(value => new Date(value))
                    .filter(date => !isNaN(date.getTime()));

                if (dateData.length === 0) return { earliest: '-', latest: '-', range: '-' };

                const timestamps = dateData.map(date => date.getTime());
                const earliest = new Date(Math.min(...timestamps));
                const latest = new Date(Math.max(...timestamps));
                const range = latest.getTime() - earliest.getTime();

                return { earliest: earliest.toISOString().split('T')[0], latest: latest.toISOString().split('T')[0], range };

            default:
                return {};
        }
    }

    const createMiniChart = (header: string, data: any[]) => {
        const chartContainer = document.getElementById(`chart-${header}`);
        if (!chartContainer) return;

        const columnData = data.map((row) => row[header]);
        const columnType = determineColumnType(columnData);

        let chartData = [];

        switch (columnType) {
            case 'number':
                chartData = binNumericData(Array.from(columnData).filter((v): v is number => typeof v === 'number'));
                break;
            case 'datetime':
                chartData = binDatetimeData(Array.from(columnData).map(value => new Date(value as string)));
                break;
            case 'string':
                chartData = binStringData(Array.from(columnData).filter((v): v is string => typeof v === 'string'));
                break;
            default:
                console.warn(`Unsupported column type: ${columnType} for header "${header}"`);
                return;
        }

        if (chartData.length === 0) return;

        try {
            const myChart = echarts.init(chartContainer);
            const option = {
                tooltip: {
                    confine: true,
                    textStyle: { fontSize: 10 }
                },
                xAxis: { type: "category", show: false },
                yAxis: { type: "value", show: false },
                series: [
                    {
                        type: columnType === "number" ? "line" : "bar",
                        data: chartData,
                        showSymbol: false
                    }
                ],
                grid: { left: 0, right: 0, top: 0, bottom: 0 }
            };
            myChart.setOption(option);

            // Handle resize
            window.addEventListener("resize", () => {
                myChart.resize();
            });
        } catch (error) {
            console.error(`Failed to initialize chart: ${error}`);
        }
    };

    return {
        binNumericData,
        binDatetimeData,
        binStringData,
        determineColumnType,
        isValidDate,
        calculateSummaryStatsForColumn,
        createMiniChart
    }

}