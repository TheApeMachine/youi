declare module 'lib-jitsi-meet' {
    interface JitsiMeetJSType {
        init: (options: {
            disableAudioLevels?: boolean;
            enableWindowOnErrorHandler?: boolean;
        }) => void;
        setLogLevel: (level: number) => void;
        logLevels: {
            ERROR: number;
            WARN: number;
            INFO: number;
            DEBUG: number;
            TRACE: number;
        };
        events: {
            conference: {
                TRACK_ADDED: string;
                CONFERENCE_JOINED: string;
                USER_JOINED: string;
                USER_LEFT: string;
            };
            connection: {
                CONNECTION_ESTABLISHED: string;
                CONNECTION_FAILED: string;
                CONNECTION_DISCONNECTED: string;
            };
        };
        JitsiConnection: new (
            appID: string | null,
            token: string | null,
            options: {
                hosts: {
                    domain: string;
                    muc: string;
                };
                serviceUrl: string;
                clientNode: string;
            }
        ) => {
            addEventListener: (event: string, listener: () => void) => void;
            removeEventListener: (event: string, listener: () => void) => void;
            connect: () => void;
            disconnect: () => void;
            initJitsiConference: (roomName: string, options: any) => JitsiConference;
        };
        createLocalTracks: (options: { devices: string[] }) => Promise<any[]>;
    }

    interface JitsiConference {
        on: (event: string, listener: (track: any) => void) => void;
        join: () => void;
        leave: () => void;
        addTrack: (track: any) => void;
    }

    const JitsiMeetJS: JitsiMeetJSType;
    export default JitsiMeetJS;
} 