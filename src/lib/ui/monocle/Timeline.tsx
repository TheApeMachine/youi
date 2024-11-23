import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";
import { Observer } from "gsap/Observer";

gsap.registerPlugin(Observer);

export const Timeline = Component({
    effect: () => {
        // Set initial styles
        let progress = 0;

        // Use GSAP Observer for wheel events
        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            onWheel: (e: any) => {
                const { deltaY } = e;

                progress += deltaY;

                document
                    .querySelectorAll(".list-item")
                    .forEach((item, index) => {
                        gsap.to(item, {
                            top: (x) => x + progress
                        });
                    });
            }
        });

        // Clean up
        return () => {
            Observer.getAll().forEach((observer) => observer.kill());
        };
    },
    render: async () => (
        <div class="timeline">
            <div class="monocle"></div>
        </div>
    )
});
