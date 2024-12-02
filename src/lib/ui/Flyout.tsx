import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "../event";
import { Header } from "./layout/Header";
import { Aside } from "./layout/Aside";
import { Article } from "./layout/Article";
import { Footer } from "./layout/Footer";

export const Flyout = Component({
    effect: ({ direction = "left" }: { direction: string }) => {
        eventBus.subscribe("mousemove", (event: any) => {
            console.log(event);
        });
    },
    render: async ({
        variant = "header",
        direction = "left"
    }: {
        variant: string;
        direction: string;
    }) => {
        switch (variant) {
            case "header":
                return <Header />;
            case "aside":
                return <Aside />;
            case "article":
                return <Article />;
            case "footer":
                return <Footer />;
            default:
                return null;
        }
    }
});
