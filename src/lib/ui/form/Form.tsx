import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Flex } from "../Flex";
import { eventBus } from "@/lib/event";

interface FormProps {
    children: any;
    className?: string;
    event?: string;
    effect?: string;
}

export const Form = Component({
    effect: () => {
        const form = document.querySelector("form");
        if (!form) return;

        form.addEventListener("submit", async (e) => {
            console.log("submit");
            e.preventDefault();
            const form = e.target as HTMLFormElement;

            // Mark all fields as touched on submit attempt
            form.querySelectorAll(".input-group").forEach((group) => {
                group.classList.add("touched");
                const input = group.querySelector("input") as HTMLInputElement;
                if (input) {
                    const isValid = input.checkValidity();
                    group.classList.toggle("error", !isValid);
                    if (!isValid) {
                        input.focus(); // Focus first invalid field
                        return;
                    }
                }
            });

            // Check HTML5 validation
            if (!form.checkValidity()) {
                return;
            }

            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // Use the event system
            const event = form.dataset.event;
            const effect = form.dataset.effect;

            if (event) {
                eventBus.publish(event, {
                    effect,
                    topic: "form",
                    trigger: "submit",
                    data,
                    originalEvent: e,
                    meta: {
                        timeStamp: Date.now(),
                        target: form.tagName,
                        initiator: "Form"
                    }
                });
            }
        });
    },
    render: ({ children, className = "", event, effect }: FormProps) => {
        return (
            <form data-trigger="submit" data-event={event} data-effect={effect}>
                <Flex
                    direction="column"
                    gap="md"
                    fullWidth
                    align="center"
                    className={className}
                >
                    {children}
                </Flex>
            </form>
        );
    }
});
