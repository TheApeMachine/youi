import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // Might be useful for more precise control
import { Post } from "./Post";
import { faker } from "@faker-js/faker";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
gsap.registerPlugin(Observer, MotionPathPlugin, ScrollTrigger);

export const Timeline = Component({
    effect: () => {
        let progress = 0;
        const tl = gsap.timeline();
        const posts = document.querySelectorAll(".timeline > .post");
        const monoclePosts = document.querySelectorAll(".monocle .post");
        const monocle = document.querySelector(".monocle") as HTMLElement;

        if (!posts.length || !monoclePosts.length || !monocle) return;

        const postHeight = monocle.offsetHeight;

        const updatePostPositions = (
            currentProgress: number,
            animate = false
        ) => {
            const duration = animate ? 0.6 : 0;
            const centerY = window.innerHeight / 2;
            const postHeight = posts[0].clientHeight;

            // Position active post centered in viewport
            const activePostY = centerY - postHeight / 2;
            console.log(activePostY + currentProgress * postHeight);

            gsap.to(posts, {
                z: 0,
                duration,
                y: (index, target, targets) => {
                    // If the target
                },
                opacity: 1,
                ease: "power2.inOut"
            });
        };

        // Initial setup
        updatePostPositions(0);

        const animate = (targetProgress: number) => {
            progress = targetProgress;
            tl.clear();

            // Animate monocle posts
            tl.to(monoclePosts, {
                duration: 0.6,
                y: -postHeight * targetProgress,
                ease: "power2.inOut"
            });

            // Animate timeline posts positions
            updatePostPositions(targetProgress, true);
        };

        // Enhanced scroll/touch handling
        Observer.create({
            target: window,
            type: "wheel,touch,pointer",
            onUp: () => animate(Math.min(progress + 1, posts.length - 1)),
            onDown: () => animate(Math.max(progress - 1, 0)),
            tolerance: 200,
            debounce: true,
            preventDefault: true
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
            <div class="timeline column">
                <div class="monocle">{monoclePosts}</div>
                {posts}
            </div>
        );
    }
});
