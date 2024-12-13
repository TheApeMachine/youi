import { jsx } from "@/lib/vdom";
import { Table } from "@/lib/ui/table/Table";
import { THead } from "@/lib/ui/table/THead";
import { TBody } from "@/lib/ui/table/TBody";
import { TFoot } from "@/lib/ui/table/TFoot";
import { Checkbox } from "@/lib/ui/form/Checkbox";
import Button from "@/lib/ui/button/Button";
import { Flex } from "@/lib/ui/Flex";
import { Popover } from "@/lib/ui/popover/Popover";
import Icon from "@/lib/ui/icon/Icon";
import { Link } from "@/lib/ui/Link";
import { stats } from "@/lib/ui/table/stats";
import { isUUID } from "@/lib/mongo/query";
import { eventBus } from "@/lib/event";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { from } from "@/lib/mongo/query";
import { List } from "@/lib/ui/List";

gsap.registerPlugin(Flip);

interface CollectionProps {
    id: string;
    data: {
        data: Record<string, any>[];
    };
}

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
            cellData.map((item) => <span>{item}</span>)
        );
        newTd.appendChild(<List items={items} />);
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
        />
    );
};

const renderTableRow = (row: any, columns: string[], rowIdx: number) => {
    return (
        <tr data-row={rowIdx}>
            <td>
                <Checkbox label="Select" name="select-row" />
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
                    <Checkbox label="Select" name="select-row" />
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
            <TFoot>
                <tr>
                    <td>
                        <Checkbox label="Select" name="select-row" />
                    </td>
                </tr>
            </TFoot>
        </Table>
    );
};

export const Collection = async(props: CollectionProps): Promise<JSX.Element> => {
    console.log("effect", props);

    eventBus.subscribe("datatable", async (payload: any) => {
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

    const tableData = await from(props.id).sortBy("Created", "desc").limit(10).exec();
    const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];

    return (
        <Flex
            direction="column"
            radius="xs"
            className="card-glass"
            scrollable
        >
            {renderTable(tableData, columns, props.id)}
        </Flex>
    );
};

export default Collection;
