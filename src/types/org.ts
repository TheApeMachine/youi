export interface Employee {
    id: string;
    name: string;
    title: string;
    imageUrl?: string;
    teamName?: string;
    department?: string;
    directReports?: Employee[];
    collapsed?: boolean;
}

export type ViewMode = 'full' | 'myTeam' | 'collaborative';

export interface OrgChartState {
    viewMode: ViewMode;
    focusedEmployeeId?: string;
    expandedNodes: Set<string>;
} 