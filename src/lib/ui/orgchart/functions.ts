import * as d3 from "d3";
import { OrgChartNode } from "./types";

interface DragAction {
    id: string;
    parentId: string;
}

interface DragEvent {
    subject: {
        id: string;
        parent: { id: string };
        descendants: () => any[];
        width: number;
        height: number;
    };
    x: number;
    y: number;
    dx: number;
    dy: number;
}

interface ChartState {
    data: OrgChartNode[];
    linksWrapper: d3.Selection<any, any, any, any>;
    nodesWrapper: d3.Selection<any, any, any, any>;
    nodeId: (d: any) => string;
}

export const orgchart = () => {
    let dragStartX = 0;
    let dragStartY = 0;
    let isDragStarting = false;

    let undoActions: DragAction[] = [];
    let redoActions: DragAction[] = [];

    let dragNode: any = null;
    let dropNode: any = null;
    let dragEnabled = false;
    let chart: any = null;

    function onDrag(element: SVGGElement, dragEvent: DragEvent) {
        if (!dragNode) return;

        const state = chart.getChartState() as ChartState;
        const g = d3.select(element);

        if (isDragStarting) {
            isDragStarting = false;
            const container = document.querySelector('.chart-container');
            if (container) {
                container.classList.add('dragging-active');
            }

            g.raise();

            const descendants = dragEvent.subject.descendants();
            const linksToRemove = [...(descendants || []), dragEvent.subject];
            const nodesToRemove = descendants.filter(
                (x: any) => x.data.id !== dragEvent.subject.id
            );

            state.linksWrapper
                .selectAll('path.link')
                .data(linksToRemove, (d: any) => state.nodeId(d))
                .remove();

            if (nodesToRemove.length) {
                state.nodesWrapper
                    .selectAll('g.node')
                    .data(nodesToRemove, (d: any) => state.nodeId(d))
                    .remove();
            }
        }

        dropNode = null;
        const cP = {
            width: dragEvent.subject.width,
            height: dragEvent.subject.height,
            left: dragEvent.x,
            right: dragEvent.x + dragEvent.subject.width,
            top: dragEvent.y,
            bottom: dragEvent.y + dragEvent.subject.height,
            midX: dragEvent.x + dragEvent.subject.width / 2,
            midY: dragEvent.y + dragEvent.subject.height / 2,
        };

        const allNodes = d3.selectAll<SVGGElement, unknown>('g.node:not(.dragging)');
        allNodes.select('rect').attr('fill', 'none');

        allNodes
            .filter(function (this: SVGGElement, d2: any) {
                const cPInner = {
                    left: d2.x,
                    right: d2.x + d2.width,
                    top: d2.y,
                    bottom: d2.y + d2.height,
                };

                if (
                    cP.midX > cPInner.left &&
                    cP.midX < cPInner.right &&
                    cP.midY > cPInner.top &&
                    cP.midY < cPInner.bottom &&
                    this.classList?.contains('droppable')
                ) {
                    dropNode = d2;
                    return true;
                }
                return false;
            })
            .select('rect')
            .attr('fill', '#e4e1e1');

        dragStartX += parseFloat(dragEvent.dx.toString());
        dragStartY += parseFloat(dragEvent.dy.toString());
        g.attr('transform', `translate(${dragStartX},${dragStartY})`);
    }

    function onDragEnd(element: SVGGElement, dragEvent: DragEvent) {
        const container = document.querySelector('.chart-container');
        if (container) {
            container.classList.remove('dragging-active');
        }

        if (!dragNode) return;

        d3.select(element).classed('dragging', false);

        if (!dropNode || dragEvent.subject.parent.id === dropNode.id) {
            chart.render();
            return;
        }

        d3.select(element).remove();

        const state = chart.getChartState() as ChartState;
        const node = state.data.find((x: OrgChartNode) => x.id === dragEvent.subject.id);
        if (!node) return;

        const oldParentId = node.parentId;
        node.parentId = dropNode.id;

        redoActions = [];
        undoActions.push({
            id: dragEvent.subject.id,
            parentId: oldParentId,
        });

        dropNode = null;
        dragNode = null;
        chart.render();
        updateDragActions();
    }

    function enableDrag() {
        dragEnabled = true;
        const container = document.querySelector('.chart-container');
        const enableButton = document.getElementById('enableDragButton');
        const dragActions = document.getElementById('dragActions');

        container?.classList.add('drag-enabled');
        enableButton?.classList.add('hide');
        dragActions?.classList.remove('hide');
    }

    function disableDrag() {
        dragEnabled = false;
        const container = document.querySelector('.chart-container');
        const enableButton = document.getElementById('enableDragButton');
        const dragActions = document.getElementById('dragActions');

        container?.classList.remove('drag-enabled');
        enableButton?.classList.remove('hide');
        dragActions?.classList.add('hide');
        undoActions = [];
        redoActions = [];
        updateDragActions();
    }

    function cancelDrag() {
        if (undoActions.length === 0) {
            disableDrag();
            return;
        }

        const state = chart.getChartState() as ChartState;
        undoActions.reverse().forEach((action) => {
            const node = state.data.find((x: OrgChartNode) => x.id === action.id);
            if (node) node.parentId = action.parentId;
        });

        disableDrag();
        chart.render();
    }

    function undo() {
        const action = undoActions.pop();
        if (action) {
            const state = chart.getChartState() as ChartState;
            const node = state.data.find((x: OrgChartNode) => x.id === action.id);
            if (!node) return;

            const currentParentId = node.parentId;
            const previousParentId = action.parentId;
            action.parentId = currentParentId;
            node.parentId = previousParentId;

            redoActions.push(action);
            chart.render();
            updateDragActions();
        }
    }

    function redo() {
        const action = redoActions.pop();
        if (action) {
            const state = chart.getChartState() as ChartState;
            const node = state.data.find((x: OrgChartNode) => x.id === action.id);
            if (!node) return;

            const currentParentId = node.parentId;
            const previousParentId = action.parentId;
            action.parentId = currentParentId;
            node.parentId = previousParentId;

            undoActions.push(action);
            chart.render();
            updateDragActions();
        }
    }

    function updateDragActions() {
        const undoButton = document.getElementById('undoButton') as HTMLButtonElement;
        const redoButton = document.getElementById('redoButton') as HTMLButtonElement;

        if (undoButton) {
            undoButton.disabled = undoActions.length === 0;
        }

        if (redoButton) {
            redoButton.disabled = redoActions.length === 0;
        }
    }

    return {
        onDrag,
        onDragEnd,
        enableDrag,
        disableDrag,
        cancelDrag,
        undo,
        redo,
        updateDragActions,
        dragStartX,
        dragStartY,
        isDragStarting,
        dragNode,
        dropNode,
    };
};
