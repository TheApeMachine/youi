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

export const render = Component({
    loader: (props: any) => {
        console.log("loader", props);
        return {
            data: from(props.id).sortBy("Created", "desc").limit(20).exec()
        };
    },
    render: async ({ data, id }) => {
        const { createMiniChart } = stats();
        const columns = Object.keys(data.data[0]);
        console.log("render", data, columns, id);

        return (
            <Flex radius="xs" className="card-glass">
                <Table collection={id}>
                    <THead>
                        <th>
                            <Checkbox />
                        </th>
                        {columns.map((column: string) => (
                            <th>
                                {column}
                                {createMiniChart(column, data.data)}
                            </th>
                        ))}
                        <th />
                    </THead>
                    <TBody>
                        {data.data.map((row: any) => (
                            <tr>
                                <td>
                                    <Checkbox />
                                </td>
                                {columns.map((column: string) => (
                                    <td>{row[column]}</td>
                                ))}
                                <td />
                            </tr>
                        ))}
                    </TBody>
                    <TFoot />
                </Table>
            </Flex>
        );
    }
});
