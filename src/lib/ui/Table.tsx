import { jsx } from "../template";
import { Component } from "./Component";
import { eventBus } from "@/lib/event";
import { fetchCollection } from "@/lib/mongo/client";
import "@/assets/datatable.css";

interface TableProps {
    children: JSX.Element[];
    collection?: string;
}

export const Table = Component({
    effect: (props: TableProps) => {
        eventBus.subscribe(
            "sortChanged",
            async (payload: { field: string; order: "asc" | "desc" }) => {
                if (!props.collection) {
                    console.error(
                        "No collection specified for Table component"
                    );
                    return;
                }

                try {
                    const sortOptions: Record<string, 1 | -1> = {
                        [payload.field]: payload.order === "asc" ? 1 : -1
                    };

                    const data = await fetchCollection(props.collection, {
                        sort: sortOptions
                    });

                    eventBus.publish("collectionData", { value: data });
                } catch (error) {
                    console.error("Error fetching collection data:", error);
                    eventBus.publish("collectionData", { value: [] });
                }
            }
        );
    },
    render: (props: TableProps) => (
        <div class="table-wrapper">
            <div class="table-scroll">
                <table>{props.children}</table>
            </div>
        </div>
    )
});
