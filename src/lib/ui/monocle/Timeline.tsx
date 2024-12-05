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

            // Get all posts
            const posts = monocleStream.querySelectorAll(
                ".post"
            ) as NodeListOf<HTMLElement>;

            // Set up the timeline container with perspective
            gsap.set(timeline, {
                position: "relative",
                perspective: 500,
                width: "840px"
            });

            // Position the background stream in z-space
            gsap.set(timelineStream, {
                z: -50,
                yPercent: 50
            });

            // Set up the monocle
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
            const tl = gsap.timeline();

            const moveToPost = (index: number) => {
                const post = posts[index];
                const rect = post.getBoundingClientRect();

                console.log(rect.top, monocle.offsetTop);

                // Update monocle height
                tl.to(monocle, {
                    height: post.offsetHeight,
                    duration: 0.5,
                    ease: "power2.out"
                })
                    .to(monocleStream, {
                        y: -(rect.top / 2 - monocle.offsetTop / 2),
                        duration: 0.5,
                        ease: "power2.out"
                    })
                    .to(timelineStream, {
                        y: -((index * (post.offsetHeight + 20)) / 4),
                        duration: 0.5,
                        ease: "power2.out"
                    });

                tl.play();
            };

            let isMoving = false;

            // Handle scrolling
            Observer.create({
                target: window,
                type: "wheel",
                onUp: () => {
                    if (isMoving) return;
                    isMoving = true;
                    currentPostIndex += 1;
                    moveToPost(currentPostIndex % posts.length);
                },
                onDown: () => {
                    if (isMoving) return;
                    isMoving = true;
                    currentPostIndex -= 1;
                    moveToPost(currentPostIndex % posts.length);
                },
                onStop: () => {
                    isMoving = false;
                }
            });

            // Initial setup
            moveToPost(0);
        });
    },
    render: async ({ data }: { data: TimelineData }) => {
        return (
            <Flex direction="column" grow={false} className="timeline">
                {/* Background stream - positioned in z-space */}
                {/* Monocle with magnified stream */}
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
