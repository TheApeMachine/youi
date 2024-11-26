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

        eventBus.publish("collectionData", {
            key: props.id,
            value: data
        });

        return { data };
    },
    render: async (props) => (
        <Table collection={props.id}>
            <THead keys={Object.keys(props.data?.[0] || {})} />
            <TBody />
            <TFoot />
        </Table>
    )
});
