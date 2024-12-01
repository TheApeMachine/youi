import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "../event";
import { Header } from "./layout/Header";

export const Flyout = Component({
    effect: ({ direction = "left" }: { direction: string }) => {
        eventBus.subscribe("mousemove", (event: any) => {
            console.log(event);
        });
    },
    render: ({
        variant = "header",
        direction = "left"
    }: {
        variant: string;
        direction: string;
    }) => {
        switch (variant) {
            case "header":
                return <Header />;
            default:
                return null;
        }
    }
});
