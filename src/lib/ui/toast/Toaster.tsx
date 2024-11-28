import { eventBus } from "@/lib/event";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";

export const Toaster = Component({
    effect: () => {
        const toaster = document.getElementById("toaster");
        let timeouts: {
            [key: string]: { id: number; startTime: number; remaining: number };
        } = {};
        let isHovering = false;

        toaster?.addEventListener("mouseenter", () => {
            isHovering = true;
            // Store remaining time for each toast
            Object.entries(timeouts).forEach(([id, timer]) => {
                clearTimeout(timer.id);
                timer.remaining =
                    timer.remaining - (Date.now() - timer.startTime);
            });

            gsap.to(".toast", {
                y: (i) => i * -80,
                z: 0,
                opacity: 1,
                duration: 0.3
            });
        });

        toaster?.addEventListener("mouseleave", () => {
            isHovering = false;
            // Resume timeouts with remaining time
            Object.entries(timeouts).forEach(([id, timer]) => {
                const toast = document.querySelector(
                    `[data-id="${id}"]`
                ) as HTMLElement;
                if (toast) {
                    startRemovalTimer(toast, id, timer.remaining);
                }
            });

            gsap.to(".toast", {
                y: (i) => i * -20,
                z: (i) => i * -100,
                opacity: (i) => Math.max(0.95 - i * 0.2, 0.3),
                duration: 0.3
            });
        });

        const startRemovalTimer = (
            toast: HTMLElement,
            id: string,
            remaining = 3000
        ) => {
            timeouts[id] = {
                id: window.setTimeout(() => {
                    if (!isHovering) {
                        gsap.to(toast, {
                            y: "-=50",
                            opacity: 0,
                            duration: 0.5,
                            ease: "power2.inOut",
                            onComplete: () => {
                                toast.remove();
                                delete timeouts[id];
                                gsap.to(".toast", {
                                    y: (i) => i * -20,
                                    z: (i) => i * -100,
                                    opacity: (i) =>
                                        Math.max(0.95 - i * 0.2, 0.3),
                                    duration: 0.5
                                });
                            }
                        });
                    }
                }, remaining),
                startTime: Date.now(),
                remaining
            };
        };

        const makeToast = (
            variant: "error" | "success" | "warning" | "info",
            title: string,
            message: string
        ) => {
            const id = Date.now().toString();
            const toast = jsx(
                "div",
                { class: `toast ${variant}`, "data-id": id },
                [jsx("h3", {}, title), jsx("p", {}, message)]
            );

            toaster?.appendChild(toast);

            gsap.to(".toast", {
                y: (i) => i * -20,
                z: (i) => i * -100,
                opacity: (i) => Math.max(0.95 - i * 0.2, 0.3),
                duration: 0.3
            });

            if (!isHovering) {
                startRemovalTimer(toast, id);
            }
        };

        eventBus.subscribe("status", (event: CustomEvent) => {
            const { variant, title, message } = event.detail;
            makeToast(variant, title, message);
        });

        window.addEventListener("keyup", (event) => {
            if (event.key === "Escape") {
                eventBus.publish(
                    "status",
                    new CustomEvent("status", {
                        detail: {
                            variant: ["success", "error", "warning", "info"][
                                Math.floor(Math.random() * 4)
                            ],
                            title: "Test Title",
                            message: "This is my test message"
                        }
                    })
                );
            }
        });
    },
    render: () => <div id="toaster"></div>
});
