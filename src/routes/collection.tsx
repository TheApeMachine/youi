import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { TBody } from "@/lib/ui/table/TBody";
import { TFoot } from "@/lib/ui/table/TFoot";
import { THead } from "@/lib/ui/table/THead";
import { Table } from "@/lib/ui/Table";
import { from } from "@/lib/mongo/query";
import { Flex } from "@/lib/ui/Flex";
import { stats } from "@/lib/ui/table/stats";
import { Checkbox } from "@/lib/ui/Checkbox";
import { Button } from "@/lib/ui/button/Button";
import { EventPayload, eventBus } from "@/lib/event";
import gsap from "gsap";
import { List } from "@/lib/ui/List";

interface CollectionProps {
    id: string;
    data: {
        data: Record<string, any>[];
    };
}

const renderCellContent = (value: any) => {
    if (
        value === null ||
        (typeof value !== "object" && !Array.isArray(value))
    ) {
        return value;
    }

    return (
        <Button
            variant="icon"
            icon={Array.isArray(value) ? "format_list_bulleted" : "dataset"}
            trigger="click"
            event="datatable"
            effect="nested:drill"
        />
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
                {data.map((row: any, rowIdx: number) => (
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
                            <Button variant="icon" icon="more_vert" />
                        </td>
                    </tr>
                ))}
            </TBody>
            <TFoot />
        </Table>
    );
};

export const render = Component({
    loader: (props: { id: string }) => {
        console.log("loader", props);
        return {
            data: from(props.id).sortBy("Created", "desc").limit(10).exec()
        };
    },
    effect: (props: any) => {
        console.log("effect", props.data.data);

        eventBus.subscribe("datatable", async (payload: EventPayload) => {
            console.log("datatable", payload);
            if (payload.effect === "nested:drill") {
                const target = payload.originalEvent?.target as HTMLElement;
                if (!target) return;

                const cell = target.closest("td");
                if (!cell) return;

                const row = cell.closest("tr");
                if (!row) return;

                const table = row.closest("table");
                if (!table) return;

                // Get the cell data directly from the data-value attribute
                const cellData = JSON.parse(
                    cell.getAttribute("data-value") || "null"
                );
                if (!cellData) return;

                // Insert a new row at the current row index, with a td that spans the entire table
                const newRow = document.createElement("tr");
                const newTd = document.createElement("td");
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
                    if (cellData.some((item) => typeof item === "object")) {
                        // Render a table for each object
                        const subTables = await Promise.all(
                            cellData.map(async (item) =>
                                renderTable([item], Object.keys(item), props.id)
                            )
                        );
                        for (const table of subTables) {
                            newTd.appendChild(table);
                        }
                    } else {
                        // Render a simple list
                        const items = await Promise.all(
                            cellData.map((item) =>
                                jsx("span", null, String(item))
                            )
                        );
                        const list = await jsx(List, { items });
                        newTd.appendChild(list);
                    }
                }

                newRow.appendChild(newTd);
                row.insertAdjacentElement("afterend", newRow);
            }
        });
    },
    render: async ({ data, id }: CollectionProps) => {
        const tableData = data.data;
        const columns = Object.keys(tableData[0]);
        console.log("render", data, columns, id);

        return (
            <Flex radius="xs" className="card-glass">
                {renderTable(tableData, columns, id)}
            </Flex>
        );
    }
});
