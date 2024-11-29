import { jsx } from "@/lib/template";
import { Component } from "../Component";
import gsap from "gsap";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(TextPlugin);

export const TypeWriter = Component({
    effect: () => {
        gsap.fromTo(
            ".typewriter",
            {
                opacity: 0
            },
            {
                opacity: 1,
                duration: 1,
                text: "Connecting to the worker pool..."
            }
        );
    },
    render: () => (
        <div class="typewriter">
            <div class="typewriter"></div>
        </div>
    )
});
