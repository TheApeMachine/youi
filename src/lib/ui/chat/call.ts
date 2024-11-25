import { requestMediaPermissions } from "./permissions";
import { Connection } from "./connection";

const loadJitsiScript = () => {
    return new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://meet.jit.si/libs/lib-jitsi-meet.min.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = (error: any) => reject(new Error(`Failed to load Jitsi script: ${error.message}`));
        document.body.appendChild(script);
    });
};

type CallState = {
    connection: any;
    room: any;
    hasStarted: boolean;
};

export const Call = ({
    options,
    createLocalTracks,
    createTrackControls,
    initRoom,
    disposeTracks
}: {
    options: any;
    createLocalTracks: any;
    createTrackControls: any;
    initRoom: any;
    disposeTracks: () => void;
}) => {
    const state: CallState = {
        connection: null,
        room: null,
        hasStarted: false
    };

    return {
        start: async () => {
            if (state.hasStarted) return;
            state.hasStarted = true;

            try {
                await loadJitsiScript();

                const permissions = await requestMediaPermissions();
                window.JitsiMeetJS.init({
                    disableAudioLevels: true,
                    enableWindowOnErrorHandler: false,
                    disableAEC: true,
                    disableNS: true,
                    disableAGC: true
                });

                window.JitsiMeetJS.setLogLevel(
                    window.JitsiMeetJS.logLevels.ERROR
                );

                const connection = await Connection(
                    options,
                    permissions,
                    createLocalTracks,
                    createTrackControls
                );

                if (!connection) {
                    throw new Error("Failed to establish connection");
                }

                const roomName = `youi-${Date.now()}`;
                state.connection = connection;
                state.room = initRoom(connection);
                state.room.join(roomName);

                return roomName;
            } catch (error) {
                console.error("Failed to initialize call:", error);
                state.hasStarted = false;
                throw error;
            }
        },
        leave: () => {
            disposeTracks();
            if (state.room) {
                state.room.leave();
            }
            if (state.connection) {
                state.connection.disconnect();
            }
            state.hasStarted = false;
        }
    };
};
