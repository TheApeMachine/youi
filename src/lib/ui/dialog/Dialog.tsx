import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus, EventPayload } from "@/lib/event";
import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

interface DialogProps {
    children?: Node | Node[];
}

export const Dialog = Component({
    effect: () => {
        const dialog = document.querySelector(
            "dialog.modal"
        ) as HTMLDialogElement;
        if (!dialog) return;

        eventBus.subscribe("dialog", (event: EventPayload) => {
            console.log(event);
            if (event.effect === "open") {
                dialog.showModal();
            } else if (event.effect === "close") {
                dialog.close();
            }
        });

        eventBus.subscribe("navigate", (event: EventPayload) => {
            console.log(event);
            dialog.close();
        });
    },
    render: async ({ children }: DialogProps) => (
        <dialog class="modal">
            <span
                class="close-button material-symbols-rounded"
                data-trigger="click"
                data-event="dialog"
                data-effect="close"
            >
                highlight_off
            </span>
            {children}
        </dialog>
    )
});
