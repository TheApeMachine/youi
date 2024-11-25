import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { eventBus } from "@/lib/event";
import { Tracks } from "@/lib/ui/chat/tracks";
import { Room } from "@/lib/ui/chat/room";
import { Controls } from "./controls";
import { Call } from "./call";

declare global {
    interface Window {
        JitsiMeetJS: any;
    }
}

export const VideoCall = Component({
    effect: () => {
        const options = {
            hosts: {
                domain: "meet.jitsi",
                muc: "muc.meet.jitsi"
            },
            serviceUrl: "https://call.fanfactory.io/http-bind"
        };

        const confOptions = {
            openBridgeChannel: true,
            enableNoAudioDetection: false,
            enableNoisyMicDetection: false,
            startWithAudioMuted: false,
            startWithVideoMuted: false
        };

        const {
            createLocalTracks,
            localTracks,
            createTrackControls,
            onRemoteTrack,
            disposeTracks
        } = Tracks();

        const roomName = `youi-${Date.now()}`;
        const { initRoom } = Room(roomName, confOptions, onRemoteTrack);

        const { start, leave } = Call({
            options,
            createLocalTracks,
            createTrackControls,
            initRoom,
            disposeTracks
        });

        // Subscribe to call events
        eventBus.subscribe("callEvent", (payload: any) => {
            if (payload.variant === "leave") {
                leave();
            }
        });

        // Start the call
        (async () => {
            try {
                const roomId = await start();
                eventBus.publish("callStarted", { roomName: roomId });
            } catch (error) {
                console.error("Failed to start call:", error);
                eventBus.publish("callError", { error });
            }
        })();

        // Cleanup on unmount
        return () => {
            leave();
        };
    },
    render: ({ localTracks = [] }) => (
        <div class="column height pad-lg bg-dark radius">
            <div id="video-container" class="row video-grid"></div>
            <div class="row space-between pad-sm gap">
                <Controls
                    variant="audio"
                    icon="mic"
                    localTracks={localTracks}
                />
                <Controls
                    variant="video"
                    icon="videocam"
                    localTracks={localTracks}
                />
                <Controls
                    variant="leave"
                    icon="call_end"
                    localTracks={localTracks}
                />
            </div>
        </div>
    )
});
