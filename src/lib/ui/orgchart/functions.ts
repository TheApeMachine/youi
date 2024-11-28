import * as d3 from "d3";
import { OrgChart } from "d3-org-chart";


export const orgchart = () => {
    let chart = null;
    let dragNode;
    let dropNode;
    let dragEnabled = false;
    let dragStartX;
    let dragStartY;
    let isDragStarting = false;
    let undoActions = [];
    let redoActions = [];

    // This is the data used - https://github.com/bumbeishvili/sample-data/blob/main/data-oracle.csv
    d3.csv(
        'https://raw.githubusercontent.com/bumbeishvili/sample-data/main/data-oracle.csv'
    ).then((data) => {
        console.log(data);
        chart = new OrgChart()
            .nodeHeight((d) => 85 + 25)
            .nodeWidth((d) => 220 + 2)
            .childrenMargin((d) => 50)
            .compactMarginBetween((d) => 35)
            .compactMarginPair((d) => 30)
            .neighbourMargin((a, b) => 20)
            .nodeContent(function (d, i, arr, state) {
                return generateContent(d);
            })
            .nodeEnter(function (node) {
                d3.select(this).call(
                    d3
                        .drag()
                        .filter(function (x, node) {
                            return dragEnabled && this.classList.contains('draggable');
                        })
                        .on('start', function (d, node) {
                            onDragStart(this, d, node);
                        })
                        .on('drag', function (dragEvent, node) {
                            onDrag(this, dragEvent);
                        })
                        .on('end', function (d) {
                            onDragEnd(this, d);
                        })
                );
            })
            .nodeUpdate(function (d) {
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

        chart.onExpandOrCollapse((event, node) => {
            console.log("expand or collapse", event, node);
            chart.fit();
        });
    });

    function onDragStart(element, dragEvent, node) {
        dragNode = node;
        const width = dragEvent.subject.width;
        const half = width / 2;
        const x = dragEvent.x - half;
        dragStartX = x;
        dragStartY = parseFloat(dragEvent.y);
        isDragStarting = true;

        d3.select(element).classed('dragging', true);
    }

    function onDrag(element, dragEvent) {
        if (!dragNode) {
            return;
        }

        const state = chart.getChartState();
        const g = d3.select(element);

        // This condition is designed to run at the start of a drag only
        if (isDragStarting) {
            isDragStarting = false;
            document
                .querySelector('.chart-container')
                .classList.add('dragging-active');

            // This sets the Z-Index above all other nodes, by moving the dragged node to be the last-child.
            g.raise();

            const descendants = dragEvent.subject.descendants();
            const linksToRemove = [...(descendants || []), dragEvent.subject];
            const nodesToRemove = descendants.filter(
                (x) => x.data.id !== dragEvent.subject.id
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
            width: dragEvent.subject.width,
            height: dragEvent.subject.height,
            left: dragEvent.x,
            right: dragEvent.x + dragEvent.subject.width,
            top: dragEvent.y,
            bottom: dragEvent.y + dragEvent.subject.height,
            midX: dragEvent.x + dragEvent.subject.width / 2,
            midY: dragEvent.y + dragEvent.subject.height / 2,
        };

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const allNodes = d3.selectAll('g.node:not(.dragging)');
        allNodes.select('rect').attr('fill', 'none');

        allNodes
            .filter(function (d2, i) {
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

        dragStartX += parseFloat(dragEvent.dx);
        dragStartY += parseFloat(dragEvent.dy);
        g.attr('transform', 'translate(' + dragStartX + ',' + dragStartY + ')');
    }

    function onDragEnd(element, dragEvent) {
        document
            .querySelector('.chart-container')
            .classList.remove('dragging-active');

        if (!dragNode) {
            return;
        }

        d3.select(element).classed('dragging', false);

        if (!dropNode) {
            chart.render();
            return;
        }

        if (dragEvent.subject.parent.id === dropNode.id) {
            chart.render();
            return;
        }

        d3.select(element).remove();

        const data = chart.getChartState().data;
        const node = data?.find((x) => x.id === dragEvent.subject.id);
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

    function generateContent(d) {
        const color = '#FFFFFF';
        const imageDiffVert = 25 + 2;
        return `
      <div class="node-container" style='
      width:${d.width}px;
      height:${d.height}px;
      padding-top:${imageDiffVert - 2}px;
      padding-left:1px;
      padding-right:1px'>
              <div class="content-container" style="font-family: 'Inter', sans-serif;  margin-left:-1px;width:${d.width - 2
            }px;height:${d.height - imageDiffVert
            }px;border-radius:0.25rem;border: ${d.data._highlighted || d.data._upToTheRootHighlighted
                ? '5px solid #E27396"'
                : '1px solid #E4E2E9"'
            } >
                  <div style="display:flex;justify-content:flex-end;margin-top:5px;margin-right:8px">#${d.data.id
            }</div>
                  <div  style="margin-top:${-imageDiffVert - 20
            }px;margin-left:${15}px;border-radius:100px;width:50px;height:50px;" ></div>
                  <div style="margin-top:${-imageDiffVert - 20
            }px;">   <img src=" ${d.data.image
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
