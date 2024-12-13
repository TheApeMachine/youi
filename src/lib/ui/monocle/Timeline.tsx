import { jsx } from "@/lib/vdom";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";
import { Observer } from "gsap/all";
import { Post } from "./Post";
import { from } from "@/lib/mongo/query";
import { Flex } from "../Flex";

gsap.registerPlugin(Observer);

/**
 * The key idea:
 * - The monocle is centered on the screen.
 * - Its height matches the current post's height.
 * - The current post is shown fully inside the monocle, which means the post is effectively "centered"
 *   (since monocle and post heights match and monocle is centered in the viewport).
 * - To switch posts, we just shift the monocleStream and timelineStream by the height of the posts.
 * - The mouse wheel direction is reversed as requested, so scrolling "down" moves to a smaller index and "up" moves to a larger index.
 */

interface TimelineData {
    items: Array<{
        _id: string;
        [key: string]: any;
    }>;
}

export const Timeline = Component({
    loader: () => {
        return {
            items: from("Item")
                .where({ Deleted: null })
                .include("User")
                .sortBy("Created", "desc")
                .limit(10)
                .exec()
        };
    },
    effect: () => {
        const timeline = document.querySelector(".timeline") as HTMLElement;
        const monocle = document.querySelector(".monocle") as HTMLElement;
        const monocleStream = document.querySelector(
            ".monocle-stream"
        ) as HTMLElement;
        const timelineStream = document.querySelector(
            ".timeline-stream"
        ) as HTMLElement;

        if (!timeline || !monocle || !monocleStream || !timelineStream) {
            console.error("Required elements not found");
            return;
        }

        const posts = Array.from(monocleStream.querySelectorAll(".post"));
        if (!posts.length) return;

        const timelinePosts = Array.from(
            timelineStream.querySelectorAll(".post")
        );
        if (!timelinePosts.length) return;

        let currentPostIndex = 0;
        let isMoving = false;
        let currentTween: gsap.core.Timeline | null = null;

        const moveToPost = (index: number) => {
            if (index < 0 || index >= posts.length) {
                console.log("Invalid index, movement cancelled");
                return;
            }

            currentPostIndex = index;

            if (currentTween) {
                console.log("Killing existing tween");
                currentTween.kill();
            }

            isMoving = true;

            const postTop = gsap.getProperty(posts[index], "top") as number;
            const windowHeight = gsap.getProperty(window, "height") as number;

            // Calculate the offset between the current post and the window center
            let calculatedOffset = postTop - windowHeight / 2;

            // Add the height of the previous post to the calculated offset, unless it's the first post
            if (index > 0) {
                calculatedOffset -= posts[index - 1].clientHeight;
            }

            // Calculate the offset between the timeline post and the window center
            const timelinePostTop = gsap.getProperty(
                timelinePosts[index],
                "top"
            ) as number;
            const timelineOffset = timelinePostTop - windowHeight / 2;

            currentTween = gsap
                .timeline({
                    onComplete: () => {
                        isMoving = false;
                    }
                })
                .to(monocle, {
                    height: posts[index].clientHeight,
                    duration: 1,
                    ease: "power2.out"
                })
                .to(
                    monocleStream,
                    {
                        y: `+=${calculatedOffset}`,
                        duration: 1,
                        ease: "power2.out"
                    },
                    0
                )
                .to(
                    timelineStream,
                    {
                        transform: `translate3d(0, ${timelineOffset}px, -250px)`,
                        duration: 1,
                        ease: "power2.out"
                    },
                    0
                );
        };

        moveToPost(0);

        Observer.create({
            target: window,
            type: "wheel",
            onDown: () => {
                console.log("\n=== Wheel DOWN detected ===");
                if (isMoving) {
                    console.log("Movement in progress, ignoring wheel event");
                    return;
                }
                const newIndex = currentPostIndex - 1;
                console.log("Attempting to move to index:", newIndex);
                if (newIndex >= 0) {
                    moveToPost(newIndex);
                } else {
                    console.log("Cannot move down: already at first post");
                }
            },
            onUp: () => {
                console.log("\n=== Wheel UP detected ===");
                if (isMoving) {
                    console.log("Movement in progress, ignoring wheel event");
                    return;
                }
                const newIndex = currentPostIndex + 1;
                console.log("Attempting to move to index:", newIndex);
                if (newIndex < posts.length) {
                    moveToPost(newIndex);
                } else {
                    console.log("Cannot move up: already at last post");
                }
            }
        });
    },
    render: async ({ data }: { data: TimelineData }) => {
        return (
            <Flex
                direction="column"
                grow={false}
                className="timeline"
                fullHeight
            >
                <div className="monocle card-glass">
                    <Flex direction="column" className="monocle-stream">
                        {data.items.map((item) => (
                            <Post
                                item={item}
                                class="post"
                                key={`monocle-${item._id}`}
                            />
                        ))}
                    </Flex>
                </div>
                <Flex direction="column" className="timeline-stream" fullWidth>
                    {data.items.map((item) => (
                        <Post
                            item={item}
                            class="post"
                            key={`timeline-${item._id}`}
                        />
                    ))}
                </Flex>
            </Flex>
        );
    }
});
