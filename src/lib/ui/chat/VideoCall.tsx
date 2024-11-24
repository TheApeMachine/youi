import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const VideoCall = Component({
    effect: () => {
        console.log("VideoCall effect");
    },
    render: () => (
        <div class="column height pad-lg bg-dark radius">
            <h2>Video Call</h2>
        </div>
    )
});
