import type { SeriesOption, EChartsOption } from 'echarts';

export type DataPoint = Record<string, number | string> | number | string;

export type Dataset = {
    dimensions: string[];
    source: DataPoint[];
};

export type ChartType = SeriesOption['type'];

export type ChartTheme = {
    colors?: string[];
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
};

export type Axis = {
    name?: string;
    type?: 'value' | 'category' | 'time' | 'log';
    position?: 'top' | 'bottom' | 'left' | 'right';
    show?: boolean;
    data?: DataPoint[];
    axisLabel?: {
        color?: string;
        fontSize?: number;
    };
};

export type LabelStyle = {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right' | 'inside' | 'outside';
    formatter?: string;
    fontSize?: number;
    fontWeight?: number;
    color?: string;
    distance?: number;
};

export type SeriesStyle = {
    color?: string;
    smooth?: boolean;
    areaStyle?: {
        opacity?: number;
    };
    lineStyle?: {
        width?: number;
        type?: 'solid' | 'dashed' | 'dotted';
    };
    label?: LabelStyle;
};

export type Series = Omit<SeriesOption, 'type'> & {
    type: ChartType;
    name?: string;
    data?: DataPoint[];
    datasetIndex?: number;
    radius?: string | string[];
    encode?: {
        x?: string;
        y?: string;
        itemName?: string;
        value?: string;
        [key: string]: string | undefined;
    };
    style?: SeriesStyle;
};

export type ChartConfig = Omit<EChartsOption, 'series'> & {
    title?: {
        text: string;
        subtext?: string;
    };
    theme?: ChartTheme;
    tooltip?: {
        show?: boolean;
        trigger?: 'item' | 'axis' | 'none';
        formatter?: string;
    };
    legend?: {
        show?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right';
    };
    xAxis?: Axis;
    yAxis?: Axis;
    grid?: {
        top?: string | number;
        right?: string | number;
        bottom?: string | number;
        left?: string | number;
    };
    datasets?: Dataset[];
    series: Series[];
};


