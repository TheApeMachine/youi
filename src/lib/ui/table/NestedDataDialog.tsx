import { jsx } from "@/lib/template";
import { Component } from "../Component";
import { Button } from "../button/Button";
import { Flex } from "../Flex";
import { Table } from "../Table";
import { THead } from "./THead";
import { TBody } from "./TBody";
import { Text } from "../Text";

interface NestedDataDialogProps {
    data: any;
    path: string[];
}

const getTypeVariant = (value: any) => {
    if (Array.isArray(value)) return "info";
    switch (typeof value) {
        case "number":
            return "success";
        case "boolean":
            return "warning";
        case "object":
            return "primary";
        default:
            return "default";
    }
};

export const NestedDataDialog = Component({
    render: ({ data, path }: NestedDataDialogProps) => (
        <Flex direction="column" gap="md" className="card-glass">
            <Flex justify="space-between" align="center">
                <Text variant="h6">{path.join(" > ")}</Text>
                <Button
                    variant="icon"
                    icon="close"
                    trigger="click"
                    event="dialog"
                    effect="close"
                />
            </Flex>
            <Table>
                <THead>
                    <th>Key</th>
                    <th>Value</th>
                    <th>Type</th>
                    <th>Actions</th>
                </THead>
                <TBody>
                    {Object.entries(data).map(([key, value]) => (
                        <tr>
                            <td>{key}</td>
                            <td>
                                {typeof value === "object" ? (
                                    <Button
                                        variant="icon"
                                        icon={
                                            Array.isArray(value)
                                                ? "format_list_bulleted"
                                                : "dataset"
                                        }
                                        trigger="click"
                                        event="dialog"
                                        effect="open"
                                        topic={JSON.stringify({
                                            component: NestedDataDialog,
                                            props: {
                                                data: value,
                                                path: [...path, key]
                                            }
                                        })}
                                    />
                                ) : (
                                    String(value)
                                )}
                            </td>
                            <td>
                                <Text variant={getTypeVariant(value)}>
                                    {Array.isArray(value)
                                        ? `Array[${value.length}]`
                                        : typeof value}
                                </Text>
                            </td>
                            <td>
                                <Button variant="icon" icon="more_vert" />
                            </td>
                        </tr>
                    ))}
                </TBody>
            </Table>
        </Flex>
    )
});
