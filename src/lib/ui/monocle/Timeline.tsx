import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";
import { Observer } from "gsap/all";
import { Post } from "./Post";
import { from } from "@/lib/mongo/query";
import { Flex } from "../Flex";

gsap.registerPlugin(Observer);

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
                .sortBy("Created", "desc")
                .limit(10)
                .exec()
        };
    },
    effect: () => {
        requestAnimationFrame(() => {
            const timeline = document.querySelector(".timeline") as HTMLElement;
            const monocle = document.querySelector(".monocle") as HTMLElement;
            const timelineStream = document.querySelector(
                ".timeline-stream"
            ) as HTMLElement;
            const monocleStream = document.querySelector(
                ".monocle-stream"
            ) as HTMLElement;

            if (!timeline || !monocle || !timelineStream || !monocleStream) {
                console.error("Required elements not found");
                return;
            }

            // Get all posts from the monocle stream (these will define our reference sizes)
            const posts = monocleStream.querySelectorAll(
                ".post"
            ) as NodeListOf<HTMLElement>;
            if (!posts.length) return;

            // Set up the main timeline container (with perspective)
            gsap.set(timeline, {
                position: "relative",
                perspective: 500,
                width: "840px"
            });

            // Position the background timeline in z-space
            gsap.set(timelineStream, {
                z: -100,
                yPercent: 50
            });

            // Set up the monocle as a fixed "window" (the magnifier)
            gsap.set(monocle, {
                position: "fixed",
                top: "50%",
                left: "50%",
                xPercent: -50,
                yPercent: -50,
                width: "840px",
                overflow: "hidden",
                zIndex: 2
            });

            let currentPostIndex = 0;
            let isMoving = false;

            // We'll create a function that moves the monocle and timeline to a given post index.
            const moveToPost = (index: number) => {
                // Ensure index wraps around if needed
                const i = (index + posts.length) % posts.length;
                currentPostIndex = i;

                const post = posts[i];
                if (!post) return;

                const rect = post.getBoundingClientRect();

                // Calculate the vertical offset needed to center the selected post in the monocle
                const monocleTargetY =
                    -((rect.top + post.offsetHeight / 2) - (window.innerHeight / 2));

                // Calculate how far to move the timeline behind to maintain the parallax illusion
                // We can base this on the index and post height. We'll assume a uniform spacing.
                // Dividing by a factor (like 4) gives a subtle parallax effect.
                const timelineTargetY = -((i * (post.offsetHeight + 20)) / 4);

                // Kill any previous timeline to avoid stacking animations
                gsap.killTweensOf([monocle, monocleStream, timelineStream]);

                const tl = gsap.timeline({
                    onComplete: () => {
                        // Allow subsequent scroll events after the movement stops
                        isMoving = false;
                    }
                });

                // First, adjust the monocle height to match the new post height.
                // Then animate monocleStream and timelineStream so that the new post is correctly aligned.
                tl.to(monocle, { height: post.offsetHeight, duration: 0.3, ease: "power2.out" })
                    .to(monocleStream, {
                        y: monocleTargetY,
                        duration: 0.5,
                        ease: "power2.out"
                    }, "<") // animate in parallel with monocle height change
                    .to(timelineStream, {
                        y: timelineTargetY,
                        duration: 0.5,
                        ease: "power2.out"
                    }, "<");
            };

            // Initially move to the first post
            moveToPost(0);

            // Create a scroll observer to detect scroll direction.
            // We only change posts on "uninterrupted" scroll events, and after each event sequence ends.
            Observer.create({
                target: window,
                type: "wheel",
                onUp: () => {
                    if (isMoving) return;
                    // Move "forward" (down the timeline)
                    isMoving = true;
                    moveToPost(currentPostIndex + 1);
                },
                onDown: () => {
                    if (isMoving) return;
                    // Move "backward" (up the timeline)
                    isMoving = true;
                    moveToPost(currentPostIndex - 1);
                },
                onStop: () => {
                    // Once the scrolling stops, isMoving is reset in the onComplete callback of the timeline
                }
            });
        });
    },
    render: async ({ data }: { data: TimelineData }) => {
        return (
            <Flex direction="column" grow={false} className="timeline">
                {/* Monocle - front layer with magnified posts */}
                <div className="monocle card-glass">
                    <Flex
                        direction="column"
                        gap="unit"
                        className="monocle-stream"
                    >
                        {data.items.map((item) => (
                            <Post
                                item={item}
                                class="post"
                                key={`monocle-${item._id}`}
                            />
                        ))}
                    </Flex>
                </div>
                {/* Background timeline stream - set back in Z-space */}
                <Flex
                    direction="column"
                    gap="unit"
                    className="timeline-stream"
                    fullWidth
                >
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
