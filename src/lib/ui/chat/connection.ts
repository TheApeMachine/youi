// Custom error class for connection errors
class ConnectionError extends Error {
    constructor(
        message: string,
        public originalError?: any
    ) {
        super(message);
        this.name = 'ConnectionError';
    }
}

export const Connection = (
    options: any,
    permissions: { audio: boolean; video: boolean },
    createLocalTracks: (permissions: { audio: boolean; video: boolean }) => Promise<any[]>,
    createTrackControls: () => void
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const connection = new window.JitsiMeetJS.JitsiConnection(
            null,
            null,
            options
        );

        const onConnectionSuccess = async () => {
            try {
                const devices = [];
                if (permissions.audio) devices.push("audio");
                if (permissions.video) devices.push("video");

                if (devices.length > 0) {
                    await createLocalTracks(permissions);
                    createTrackControls();
                }

                resolve(connection);
            } catch (error) {
                reject(new ConnectionError(
                    "Error setting up conference: " + (error as Error).message,
                    error
                ));
            }
        };

        const onConnectionFailed = (error: any) => {
            reject(new ConnectionError(
                "Connection failed: " + error?.message || String(error),
                error
            ));
        };

        const onDisconnected = () => {
            console.log("Connection disconnected");
            connection.removeEventListener(
                window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
                onConnectionSuccess
            );
            connection.removeEventListener(
                window.JitsiMeetJS.events.connection.CONNECTION_FAILED,
                onConnectionFailed
            );
            connection.removeEventListener(
                window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
                onDisconnected
            );
        };

        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            onConnectionSuccess
        );

        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_FAILED,
            onConnectionFailed
        );

        connection.addEventListener(
            window.JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
            onDisconnected
        );

        connection.connect();
    });
};
