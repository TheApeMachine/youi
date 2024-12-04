import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import { ScrollTrigger } from "gsap/ScrollTrigger"; // Might be useful for more precise control
import { Post } from "./Post";
import { faker } from "@faker-js/faker";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { from } from "@/lib/mongo/query";
import { Flex } from "../Flex";
gsap.registerPlugin(Observer, MotionPathPlugin, ScrollTrigger);

interface TimelineItem {
    _id: string;
    Text: string;
    user?: {
        ImageURL: string;
        FirstName: string;
    };
    UserImgUrl?: string;
    UserName?: string;
}

export const Timeline = Component({
    loader: () => {
        return {
            items: from("Item")
                .where({ Deleted: null })
                .sortBy("Created", "desc")
                .limit(10)
                .exec()
        };
    },
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

            gsap.to(posts, {
                z: 0,
                duration,
                y: (index: number) => {
                    const offset = index - currentProgress;
                    return activePostY + offset * postHeight * 1.1;
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
    render: async ({ data }) => {
        console.log("Timeline data:", data);

        return (
            <Flex direction="column" grow={false} className="timeline">
                <Flex direction="column" className="monocle card-glass">
                    {data.items.map((item: any) => (
                        <Post
                            item={item}
                            class="post monocle-post"
                            key={item._id}
                        />
                    ))}
                </Flex>
                {data.items.map((item: any) => (
                    <Post item={item} class="post" key={item._id} />
                ))}
            </Flex>
        );
    }
});
