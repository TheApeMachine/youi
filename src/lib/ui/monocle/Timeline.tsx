import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { Post } from "./Post";

gsap.registerPlugin(Observer);

export const Timeline = Component({
    effect: () => {
        // Set initial styles
        let progress = 0;

        // Calculate blur and darkness based on distance from center
        const updatePostEffects = () => {
            const windowCenter = window.innerHeight / 2;
            document.querySelectorAll(".timeline > .post").forEach((item) => {
                const rect = item.getBoundingClientRect();
                const distanceFromCenter = Math.abs(rect.top + rect.height / 2 - windowCenter);
                const blur = Math.min(distanceFromCenter / 50, 5);
                const zPos = -(distanceFromCenter * 0.8);
                const darkness = Math.max(1 - distanceFromCenter / 300, 0.2);

                gsap.to(item, {
                    filter: `blur(${blur}px)`,
                    z: zPos,
                    opacity: darkness,
                    duration: 0.2
                });
            });
        };

        // Use GSAP Observer for wheel events
        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            onWheel: (e: any) => {
                const { deltaY } = e;
                progress += deltaY;

                document.querySelectorAll(".post").forEach((item) => {
                    gsap.to(item, {
                        y: (x) => x + progress
                    });
                });

                // Update blur and darkness effects after position change
                updatePostEffects();
            }
        });

        // Initial effect application
        updatePostEffects();

        // Clean up
        return () => {
            Observer.getAll().forEach((observer) => observer.kill());
        };
    },
    render: async () => (
        <div class="timeline column gap">
            <div class="monocle column shrink">
                {Array.from({ length: 10 }).map((_, i) => (
                    <Post />
                ))}
            </div>
            {Array.from({ length: 10 }).map((_, i) => (
                <Post />
            ))}
        </div>
    )
});
