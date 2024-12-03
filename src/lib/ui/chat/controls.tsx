import { jsx } from "@/lib/template";
import { Component } from "../Component";
import { eventBus } from "@/lib/event";

// Define types for our variants
type VariantType = "audio" | "video" | "leave";
type VariantConfig = {
    muted: boolean;
    iconOn: string;
    iconOff: string;
};
type VariantsConfig = Record<VariantType, VariantConfig>;

type ControlsProps = {
    variant: VariantType;
    icon: string;
    localTracks: any[];
};

export const Controls = Component<ControlsProps>({
    effect: ({ localTracks, variant }: ControlsProps) => {
        let variantsMuted: VariantsConfig = {
            audio: {
                muted: false,
                iconOn: "mic",
                iconOff: "mic_off"
            },
            video: {
                muted: false,
                iconOn: "videocam",
                iconOff: "videocam_off"
            },
            leave: {
                muted: false,
                iconOn: "call_end",
                iconOff: "call_end"
            }
        };

        // Subscribe to button events
        eventBus.subscribe(`${variant}Event`, (payload: any) => {
            if (payload.variant !== variant) return;

            if (variant === "leave") {
                eventBus.publish("callEvent", { variant: "leave" });
                return;
            }

            const track = localTracks?.find(
                (track: any) => track.getType() === variant
            );

            if (track) {
                const config = variantsMuted[variant as keyof VariantsConfig];
                config.muted = !config.muted;

                if (config.muted) {
                    track.mute();
                } else {
                    track.unmute();
                }

                const iconElement = document.querySelector(
                    `[data-variant="${variant}"] .material-icons`
                );
                if (iconElement) {
                    iconElement.textContent = config.muted
                        ? config.iconOff
                        : config.iconOn;
                }
            }
        });
    },
    render: ({ variant, icon }: ControlsProps) => (
        <button
            data-event={`${variant}Event`}
            data-trigger="click"
            class="control-button"
        >
            <span class="material-icons">{icon}</span>
        </button>
    )
});
