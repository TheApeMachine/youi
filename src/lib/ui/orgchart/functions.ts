import * as d3 from "d3";
import { OrgChart } from "d3-org-chart";
import { D3DragEvent, HierarchyNode } from 'd3';

// Types for node data
interface NodeData {
    id: string;
    parentId: string;
    name: string;
    position: string;
    image: string;
    _expanded?: boolean;
    _highlighted?: boolean;
    _upToTheRootHighlighted?: boolean;
    _centered?: boolean;
    _pagingButton?: boolean;
    _pagingStep?: number;
    _directSubordinates?: number;
    _totalSubordinates?: number;
    _directSubordinatesPaging?: number;
}

// Types for chart node
interface ChartNode extends HierarchyNode<NodeData> {
    width: number;
    height: number;
    x: number;
    y: number;
    firstCompact?: boolean;
    compactEven?: boolean;
    flexCompactDim?: [number, number];
    firstCompactNode?: ChartNode;
    row?: number;
}

// Types for drag events
interface DragEvent {
    x: number;
    y: number;
    dx: number;
    dy: number;
    subject: ChartNode;
}

// Types for DOM elements
interface D3DOMElement extends Element {
    classList: DOMTokenList;
}

// Types for chart state
interface ChartState {
    data: NodeData[];
    nodeId: (d: NodeData) => string;
    linksWrapper: d3.Selection<SVGGElement, unknown, null, undefined>;
    nodesWrapper: d3.Selection<SVGGElement, unknown, null, undefined>;
    ctx: CanvasRenderingContext2D;
}

export const orgchart = () => {
    let chart: OrgChart<NodeData> | null = null;
    let dragNode: ChartNode | null = null;
    let dropNode: ChartNode | null = null;
    let dragEnabled = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let isDragStarting = false;
    let undoActions: Array<{ id: string; parentId: string }> = [];
    let redoActions: Array<{ id: string; parentId: string }> = [];

    // This is the data used - https://github.com/bumbeishvili/sample-data/blob/main/data-oracle.csv
    d3.csv(
        'https://raw.githubusercontent.com/bumbeishvili/sample-data/main/data-oracle.csv'
    ).then((data) => {
        chart = new OrgChart<NodeData>()
            .nodeHeight(() => 85 + 25)
            .nodeWidth(() => 220 + 2)
            .childrenMargin(() => 50)
            .compactMarginBetween(() => 35)
            .compactMarginPair(() => 30)
            .neighbourMargin(() => 20)
            .setActiveNodeCentered(true)
            .nodeContent(function (d) {
                return generateContent(d);
            })
            .nodeEnter(function (this: D3DOMElement, node: ChartNode) {
                d3.select(this).call(
                    d3.drag()
                        .filter(function (this: D3DOMElement, x: any, node: ChartNode) {
                            return dragEnabled && this.classList.contains('draggable');
                        })
                        .on('start', function(this: D3DOMElement, event: D3DragEvent<D3DOMElement, ChartNode, unknown>) {
                            onDragStart(this, event, event.subject);
                        })
                        .on('drag', function(this: D3DOMElement, event: D3DragEvent<D3DOMElement, ChartNode, unknown>) {
                            onDrag(this, event);
                        })
                        .on('end', function(this: D3DOMElement, event: D3DragEvent<D3DOMElement, ChartNode, unknown>) {
                            onDragEnd(this, event);
                        })
                );
            })
            .nodeUpdate(function (this: D3DOMElement, d: ChartNode) {
                if (d.id === '102' || d.id === '120' || d.id === '124') {
                    d3.select(this).classed('droppable', false);
                } else {
                    d3.select(this).classed('droppable', true);
                }

                if (d.id === '101') {
                    d3.select(this).classed('draggable', false);
                } else {
                    d3.select(this).classed('draggable', true);
                }
            })
            .container('.chart-container')
            .data(data)
            .render();

        // chart.onExpandOrCollapse((event, node) => {
        //     chart.fit();
        // });
    });

    // Event handler functions with proper types
    function onDragStart(
        element: D3DOMElement, 
        event: D3DragEvent<D3DOMElement, ChartNode, unknown>, 
        node: ChartNode
    ): void {
        dragNode = node;
        const width = event.subject.width;
        const half = width / 2;
        const x = event.x - half;
        dragStartX = x;
        dragStartY = event.y;
        isDragStarting = true;

        d3.select(element).classed('dragging', true);
    }

    function onDrag(element: D3DOMElement, event: D3DragEvent<D3DOMElement, ChartNode, unknown>): void {
        if (!dragNode || !chart) return;

        const state = chart.getChartState() as ChartState;
        const g = d3.select(element);

        if (isDragStarting) {
            isDragStarting = false;
            const container = document.querySelector('.chart-container');
            if (container) {
                container.classList.add('dragging-active');
            }

            // This sets the Z-Index above all other nodes, by moving the dragged node to be the last-child.
            g.raise();

            const subject = event.subject as ChartNode;
            const descendants = subject.descendants();
            const linksToRemove = [...(descendants || []), subject];
            const nodesToRemove = descendants.filter(
                (x) => x.data.id !== subject.id
            );

            // Remove all links associated with the dragging node
            state['linksWrapper']
                .selectAll('path.link')
                .data(linksToRemove, (d) => state.nodeId(d))
                .remove();

            // Remove all descendant nodes associated with the dragging node
            if (nodesToRemove) {
                state['nodesWrapper']
                    .selectAll('g.node')
                    .data(nodesToRemove, (d) => state.nodeId(d))
                    .remove();
            }
        }

        dropNode = null;
        const cP = {
            width: subject.width,
            height: subject.height,
            left: event.x,
            right: event.x + subject.width,
            top: event.y,
            bottom: event.y + subject.height,
            midX: event.x + subject.width / 2,
            midY: event.y + subject.height / 2,
        };

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const allNodes = d3.selectAll('g.node:not(.dragging)');
        allNodes.select('rect').attr('fill', 'none');

        allNodes
            .filter(function (d2) {
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
                    this.classList.contains('droppable')
                ) {
                    dropNode = d2;
                    return d2;
                }
            })
            .select('rect')
            .attr('fill', '#e4e1e1');

        dragStartX += parseFloat(event.dx);
        dragStartY += parseFloat(event.dy);
        g.attr('transform', 'translate(' + dragStartX + ',' + dragStartY + ')');
    }

    function onDragEnd(element: D3DOMElement, event: D3DragEvent<D3DOMElement, ChartNode, unknown>): void {
        const container = document.querySelector('.chart-container');
        if (container) {
            container.classList.remove('dragging-active');
        }

        if (!dragNode || !chart) return;

        d3.select(element).classed('dragging', false);

        if (!dropNode) {
            chart.render();
            return;
        }

        if (event.subject.parent.id === dropNode.id) {
            chart.render();
            return;
        }

        d3.select(element).remove();

        const data = chart.getChartState().data;
        const node = data?.find((x) => x.id === event.subject.id);
        const oldParentId = node.parentId;
        node.parentId = dropNode.id;

        redoActions = [];
        undoActions.push({
            id: event.subject.id,
            parentId: oldParentId,
        });

        dropNode = null;
        dragNode = null;
        chart.render();
        updateDragActions();
    }

    function generateContent(d) {
        const color = '#FFFFFF';
        const imageDiffVert = 25 + 2;
        return `
      <div class="node-container" style='
      width: ${d.width}px;
      height:${d.height}px;
      padding-top:${imageDiffVert - 2}px;
      padding-left:1px;
      padding-right:1px'>
              <div class="content-container border-dark bg-light" style="margin-left:-1px; width: ${d.width - 2
            }px; height: ${d.height - imageDiffVert
            }px;">
                  <div style="display:flex;justify-content:flex-end;margin-top:5px;margin-right:8px">#${d.data.id
            }</div>
                  <div  style="margin-top: ${-imageDiffVert - 20
            }px; margin-left: ${15}px; border-radius: 100px; width: 50px; height: 50px;" ></div>
                  <div style="margin-top:${-imageDiffVert - 20
            }px;">   <img class="ring-darker" src=" ${d.data.image
            }" style="margin-left:${20}px;border-radius:100px;width:40px;height:40px;" /></div>
                  <div style="font-size:15px;color:#08011E;margin-left:20px;margin-top:10px">  ${d.data.name
            } </div>
                  <div style="color:#716E7B;margin-left:20px;margin-top:3px;font-size:10px;"> ${d.data.position
            } </div>

              </div>
          </div>
      `;
    }

    const render = () => {
        return `
    <div class="chart-container" > </div>
    `;
    };

    return { render };
};
