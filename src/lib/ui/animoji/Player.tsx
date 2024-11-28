import { jsx } from "@/lib/template";
import { Component } from "../Component";

export const Player = Component({
    render: () => (
        <dotlottie-player
            src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f680/lottie.json"
            background="transparent"
            speed="1"
            className="player"
            data-trigger="click"
            data-event="menu"
            loop
            autoplay
        ></dotlottie-player>
    )
});
