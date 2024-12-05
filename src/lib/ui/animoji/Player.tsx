import { jsx } from "@/lib/template";
import { Component } from "../Component";

interface PlayerProps {
    data: {
        animoji: string;
    };
}

export const Player = Component({
    render: async (props: PlayerProps) => {
        if (!props?.data?.animoji) {
            console.error("Missing animoji data in props", props);
            return null;
        }

        console.log("Player", props.data);
        // Convert the imported JSON to a data URL
        const animoji = await import(
            `@/assets/animoji/${props.data.animoji}.json`
        );
        const jsonString = JSON.stringify(animoji.default);
        const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(
            jsonString
        )}`;

        return (
            <dotlottie-player
                src={dataUrl}
                background="transparent"
                speed="1"
                className="player"
                data-trigger="click"
                data-event="menu"
                loop
                autoplay
            ></dotlottie-player>
        );
    }
});
