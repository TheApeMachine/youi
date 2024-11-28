import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { TBody } from "@/lib/ui/table/TBody";
import { TFoot } from "@/lib/ui/table/TFoot";
import { THead } from "@/lib/ui/table/THead";
import { Table } from "@/lib/ui/Table";
import { fetchCollection } from "@/lib/mongo/client";
import { eventBus } from "@/lib/event";

export const render = Component({
    effect: async (props) => {
        if (!props?.id) return { data: [] };

        const data = await fetchCollection(props.id, {
            limit: 10
        });

        // Get all unique keys from all rows
        const allKeys = data.reduce((keys: Set<string>, row: any) => {
            Object.keys(row).forEach((key) => keys.add(key));
            return keys;
        }, new Set<string>());

        eventBus.publish("collectionData", {
            key: props.id,
            value: data,
            columns: Array.from(allKeys)
        });

        return { data, columns: Array.from(allKeys) };
    },
    render: async (props) => (
        <Table collection={props.id}>
            <THead keys={props.columns || []} />
            <TBody columns={props.columns || []} />
            <TFoot />
        </Table>
    )
});
