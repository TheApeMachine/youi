import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus, EventPayload } from "@/lib/event";
import gsap from "gsap";
import Flip from "gsap/Flip";

gsap.registerPlugin(Flip);

interface DialogProps {
    children?: Node | Node[];
}

export const Dialog = Component<DialogProps>({
    effect: () => {
        const dialog = document.querySelector(
            "dialog.modal"
        ) as HTMLDialogElement;
        if (!dialog) return;

        eventBus.subscribe("dialog", (event: EventPayload) => {
            if (event.effect === "open") {
                const state = Flip.getState(dialog);
                dialog.showModal();
                gsap.set(dialog, {
                    opacity: 1,
                    transform: "translate(-50%, -50%)"
                });
                Flip.from(state, { duration: 0.5, ease: "power1.inOut" });
            } else if (event.effect === "close") {
                const state = Flip.getState(dialog);
                Flip.from(state, {
                    duration: 0.5,
                    ease: "power1.inOut",
                    onComplete: () => {
                        dialog.close();
                    }
                });
            }
        });

        // Also handle menu events for backward compatibility
        eventBus.subscribe("menu", (_: EventPayload) => {
            const state = Flip.getState(dialog);
            dialog.showModal();
            gsap.set(dialog, {
                opacity: 1,
                transform: "translate(-50%, -50%)"
            });
            Flip.from(state, { duration: 0.5, ease: "power1.inOut" });
        });
    },
    render: async ({ children }) => (
        <dialog class="modal">
            <header>
                <span
                    class="close-button material-icons"
                    data-trigger="click"
                    data-event="dialog"
                    data-effect="close"
                >
                    highlight_off
                </span>
            </header>
            <main>{children}</main>
            <footer></footer>
        </dialog>
    )
});
