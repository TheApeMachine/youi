import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { TBody } from "@/lib/ui/table/TBody";
import { TFoot } from "@/lib/ui/table/TFoot";
import { THead } from "@/lib/ui/table/THead";
import { Table } from "@/lib/ui/Table";
import { from, isUUID } from "@/lib/mongo/query";
import { Flex } from "@/lib/ui/Flex";
import { stats } from "@/lib/ui/table/stats";
import { Checkbox } from "@/lib/ui/Checkbox";
import { Button } from "@/lib/ui/button/Button";
import { EventPayload, eventBus } from "@/lib/event";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { List } from "@/lib/ui/List";
import { Popover } from "@/lib/ui/Popover";
import { Icon } from "@/lib/ui/Icon";
import { Link } from "@/lib/ui/Link";

gsap.registerPlugin(Flip);

interface CollectionProps {
    id: string;
    data: {
        data: Record<string, any>[];
    };
}

const renderCellContent = (value: any) => {
    if (value === null) return value;

    if (typeof value !== "object" && !Array.isArray(value)) {
        if (isUUID(value)) {
            return <Link href={`/object/${value}`}>{value}</Link>;
        }

        return value;
    }

    return (
        <Button
            variant="icon"
            icon={Array.isArray(value) ? "lists" : "dataset"}
            trigger="click"
            event="datatable"
            effect="nested:drill"
        />
    );
};

const renderTableRow = (row: any, columns: string[], rowIdx: number) => {
    return (
        <tr data-row={rowIdx}>
            <td>
                <Checkbox />
            </td>
            {columns.map((column: string, cellIdx: number) => (
                <td
                    data-cell={cellIdx}
                    data-value={JSON.stringify(row[column])}
                >
                    {renderCellContent(row[column])}
                </td>
            ))}
            <td>
                <Popover content={<div>Hello</div>}>
                    <Icon icon="more_vert" />
                </Popover>
            </td>
        </tr>
    );
};

const renderTable = (data: any, columns: string[], id: string) => {
    console.log("renderTable", data, columns, id);
    const { createMiniChart } = stats();

    if (!data) {
        return <div>No data available</div>;
    }

    return (
        <Table collection={id}>
            <THead>
                <th>
                    <Checkbox />
                </th>
                {columns.map((column: string) => (
                    <th>
                        {column}
                        {createMiniChart(column, data)}
                    </th>
                ))}
                <th />
            </THead>
            <TBody>
                {data.map((row: any, rowIdx: number) =>
                    renderTableRow(row, columns, rowIdx)
                )}
            </TBody>
            <TFoot />
        </Table>
    );
};

const handleArrayDrill = async (
    items: any[],
    props: any,
    cellData: any[],
    newTd: HTMLElement
) => {
    if (cellData.some((item) => typeof item === "object")) {
        const subTable = await renderTable(
            [],
            Object.keys(cellData[0]),
            props.id
        );
        // Render a table-row for each object
        const rows = await Promise.all(
            cellData.map(async (item, itemIdx) =>
                renderTableRow(item, Object.keys(item), itemIdx)
            )
        );

        for (const row of rows) {
            subTable.appendChild(row);
        }

        newTd.appendChild(subTable);
    } else {
        // Render a simple list
        const items = await Promise.all(
            cellData.map((item) => jsx("span", null, String(item)))
        );
        const list = await jsx(List, { items });
        newTd.appendChild(list);
    }
};

const handleDrill = async (
    cell: HTMLElement,
    table: HTMLTableElement,
    props: any,
    row: HTMLTableRowElement
) => {
    cell.dataset.isDrilling = "true";

    // Get the cell data directly from the data-value attribute
    const cellData = JSON.parse(cell.getAttribute("data-value") ?? "null");
    if (!cellData) return;

    // Insert a new row at the current row index, with a td that spans the entire table
    const newRow = document.createElement("tr");
    const newTd = document.createElement("td");
    newTd.classList.add("drill-cell");
    newTd.colSpan = table.querySelectorAll("td").length;

    // If the cellData is an object, we should render a sub-table.
    if (typeof cellData === "object" && !Array.isArray(cellData)) {
        const subTable = await renderTable(
            [cellData],
            Object.keys(cellData),
            props.id
        );
        newTd.appendChild(subTable);
    } else if (Array.isArray(cellData)) {
        await handleArrayDrill(cellData, props, cellData, newTd);
    }

    newRow.appendChild(newTd);
    row.insertAdjacentElement("afterend", newRow);
};

const closeDrill = async (
    cell: HTMLElement,
    table: HTMLTableElement,
    row: HTMLTableRowElement
) => {
    cell.removeAttribute("data-is-drilling");
    const nextRow = table.rows[row.rowIndex + 1];
    if (!nextRow) return;

    nextRow.remove();
};

export const render = Component({
    loader: (props: { id: string }) => {
        console.log("loader", props);
        return {
            data: from(props.id).sortBy("Created", "desc").limit(10).exec()
        };
    },
    effect: (props: any) => {
        console.log("effect", props);

        eventBus.subscribe("datatable", async (payload: EventPayload) => {
            const state = Flip.getState(document.querySelector("table"));

            if (payload.effect === "nested:drill") {
                const target = payload.originalEvent?.target as HTMLElement;
                if (!target) return;

                const cell = target.closest("td");
                if (!cell) return;

                const row = cell.closest("tr");
                if (!row) return;

                const table = row.closest("table");
                if (!table) return;

                if (cell.dataset.isDrilling) {
                    await closeDrill(cell, table, row);
                } else {
                    await handleDrill(cell, table, props, row);
                }

                Flip.from(state, {
                    duration: 0.5,
                    stagger: 0.1
                });
            }
        });
    },
    render: async ({ data, id }: CollectionProps) => {
        const tableData = data.data;
        const columns = Object.keys(tableData[0]);
        console.log("render", data, columns, id);

        return (
            <Flex
                direction="column"
                radius="xs"
                className="card-glass"
                scrollable
            >
                {renderTable(tableData, columns, id)}
            </Flex>
        );
    }
});
