import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // Might be useful for more precise control
import { Post } from "./Post";
import { faker } from "@faker-js/faker";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(Observer, MotionPathPlugin, ScrollTrigger);

const alignOrigins = (fromElement: HTMLElement, toElement: HTMLElement) => {
    const elements = gsap.utils.toArray([fromElement, toElement]);
    const [fromEl, toEl] = elements as HTMLElement[];
    const style = window.getComputedStyle(toEl);
    const origins = style.transformOrigin.split(" ");

    const newOrigin = MotionPathPlugin.convertCoordinates(toEl, fromEl, {
        x: parseFloat(origins[0]),
        y: parseFloat(origins[1])
    });

    // Store original bounds
    const bounds1 = fromEl.getBoundingClientRect();

    // Apply new transform origin with eased transition
    gsap.to(fromEl, {
        transformOrigin: `${newOrigin.x}px ${newOrigin.y}px`,
        duration: 0.3,
        ease: "power2.out"
    });

    // Adjust position smoothly
    const bounds2 = fromEl.getBoundingClientRect();
    gsap.to(fromEl, {
        x: `+=${bounds1.left - bounds2.left}`,
        y: `+=${bounds1.top - bounds2.top}`,
        duration: 0.3,
        ease: "power2.out"
    });
};

export const Timeline = Component({
    effect: () => {
        let progress = 0;
        const tl = gsap.timeline();
        const posts = document.querySelectorAll(".timeline > .post");
        const monoclePosts = document.querySelectorAll(".monocle .post");
        const monocle = document.querySelector(".monocle") as HTMLElement;

        if (!posts.length || !monoclePosts.length || !monocle) return;

        gsap.to(posts, {
            z: (index: number) => -220,
            duration: 0.6,
            ease: "power2.inOut",
            stagger: 0.05
        });

        const animate = (targetProgress: number) => {
            progress = targetProgress;
            tl.clear();

            // Create a smooth transition effect
            tl.to(monoclePosts, {
                duration: 0.6,
                y: gsap.utils.distribute({
                    base:
                        monocle.offsetTop -
                        monocle.offsetHeight * targetProgress,
                    amount: monocle.offsetHeight,
                    from: targetProgress,
                    grid: "auto",
                    axis: "y",
                    ease: "power2.inOut"
                })
            }).to(
                posts,
                {
                    duration: 0.6,
                    y: gsap.utils.distribute({
                        base:
                            monocle.offsetTop +
                            monocle.offsetHeight +
                            posts[targetProgress].scrollTop * 2,
                        amount: monocle.offsetHeight,
                        from: targetProgress,
                        grid: "auto",
                        axis: "y",
                        ease: "power2.inOut"
                    })
                },
                "<"
            );
        };

        // Enhanced scroll/touch handling
        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            onUp: () => animate(Math.min(progress + 1, posts.length - 1)),
            onDown: () => animate(Math.max(progress - 1, 0)),
            preventDefault: true
        });

        // Optional: Add keyboard navigation
        document.addEventListener("keydown", (e) => {
            if (e.key === "ArrowUp")
                animate(Math.min(progress + 1, posts.length - 1));
            if (e.key === "ArrowDown") animate(Math.max(progress - 1, 0));
        });

        return () => {
            Observer.getAll().forEach((observer) => observer.kill());
        };
    },
    render: async () => {
        const postData = Array.from({ length: 10 }).map((_, i) => ({
            timestamp: Date.now() + i,
            sender: faker.person.fullName(),
            id: i // Add unique ID for better tracking
        }));

        const posts = postData.map((data) => (
            <Post {...data} class="post" data-index={data.id} />
        ));

        const monoclePosts = postData.map((data) => (
            <Post {...data} class="post monocle-post" data-index={data.id} />
        ));

        return (
            <div class="timeline column gap">
                <div class="monocle">
                    <div class="monocle-content">{monoclePosts}</div>
                </div>
                {posts}
            </div>
        );
    }
});
