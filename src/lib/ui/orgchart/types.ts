export interface OrgChartNode {
    id: string;
    parentId: string;
    name: string;
    position: string;
    image: string;
    _highlighted?: boolean;
    _upToTheRootHighlighted?: boolean;
    width?: number;
    height?: number;
}

export interface ChartState {
    data: OrgChartNode[];
    linksWrapper: d3.Selection<SVGGElement, unknown, null, undefined>;
    nodesWrapper: d3.Selection<SVGGElement, unknown, null, undefined>;
    nodeId: (d: any) => string;
}

export interface D3OrgChart {
    nodeHeight: (d?: any) => number;
    nodeWidth: (d?: any) => number;
    childrenMargin: (d: OrgChartNode) => number;
    compactMarginBetween: (d: OrgChartNode) => number;
    compactMarginPair: (d: OrgChartNode) => number;
    neighbourMargin: (a: OrgChartNode, b: OrgChartNode) => number;
    nodeContent: (d: OrgChartNode, i: number, arr: any[], state: any) => string;
    nodeEnter: (node: any) => void;
    nodeUpdate: (d: OrgChartNode) => void;
    container: (selector: string) => D3OrgChart;
    data: (data: OrgChartNode[]) => D3OrgChart;
    render: () => void;
    getChartState: () => ChartState;
}

declare global {
    interface Window {
        d3: typeof import('d3') & {
            OrgChart: new () => D3OrgChart;
        };
    }
} 