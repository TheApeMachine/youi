import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import gsap from "gsap";
import { Observer, Flip } from "gsap/all";
import { Post } from "./Post";
import { from } from "@/lib/mongo/query";
import { Flex } from "../Flex";
gsap.registerPlugin(Observer, Flip);

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
            let currentPost = 0;
            const monoclePosts = document.querySelectorAll(".monocle .post");
            const timelinePosts = document.querySelectorAll(".timeline > .post");
            const monocle = document.querySelector(".monocle") as HTMLElement;
            const timeline = document.querySelector(".timeline") as HTMLElement;
            const viewportCenter = window.innerHeight / 2;

            const updateMonocle = () => {
                gsap.set(monocle, {
                    position: "absolute",
                    height: monoclePosts[currentPost].offsetHeight,
                    top: viewportCenter
                });

                Flip.fit(monoclePosts[currentPost], monocle, {
                    fitChild: monoclePosts[currentPost],
                    scale: true,
                    duration: 2,
                    ease: "power1.inOut"
                });
            }

            Observer.create({
                type: "wheel,touch,pointer",
                wheelSpeed: -1,
                onDown: () => {
                    currentPost--;
                    if (currentPost < 0) currentPost = monoclePosts.length - 1;
                    updateMonocle();
                },
                onUp: () => {
                    currentPost++;
                    if (currentPost >= monoclePosts.length) currentPost = 0;
                    updateMonocle();
                },
                tolerance: 100,
                preventDefault: true
            });
        });
    },
    render: async ({ data }: { data: any }) => {
        console.log("Timeline data:", data);

        return (
            <Flex direction="column" grow={false} className="timeline">
                <Flex direction="column" gap="unit" className="monocle card-glass">
                    {data.items.map((item: any) => (
                        <Post
                            item={item}
                            class="post monocle-post"
                            key={item._id}
                        />
                    ))}
                </Flex>
            </Flex>
        );
    }
});
