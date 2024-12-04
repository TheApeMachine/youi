import { jsx } from "@/lib/template";
import { Component } from "./Component";
import { eventBus } from "@/lib/event";

interface DialogState {
    isOpen: boolean;
    component: ComponentType | null;
    props: Record<string, unknown>;
}

interface DialogOpenEvent {
    component: ComponentType;
    props: Record<string, unknown>;
}

interface DialogUpdateEvent {
    props: Record<string, unknown>;
}

export const Dialog = Component({
    effect: () => {
        let state: DialogState = {
            isOpen: false,
            component: null,
            props: {}
        };

        eventBus.subscribe(
            "dialog:open",
            ({ component, props }: DialogOpenEvent) => {
                state = {
                    isOpen: true,
                    component,
                    props
                };
            }
        );

        eventBus.subscribe("dialog:close", () => {
            state = {
                isOpen: false,
                component: null,
                props: {}
            };
        });

        eventBus.subscribe("dialog:update", ({ props }: DialogUpdateEvent) => {
            if (state.isOpen) {
                state = {
                    ...state,
                    props: {
                        ...state.props,
                        ...props
                    }
                };
            }
        });
    },
    render: () => (
        <div className="dialog-container">
            {/* Dialog content will be rendered here */}
        </div>
    )
});
