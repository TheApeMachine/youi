export const Tracks = () => {
    let localTracks: any[] = [];

    const createLocalTracks = async (permissions: { audio: boolean; video: boolean }) => {
        try {
            const devices: string[] = [];
            if (permissions.video) devices.push("video");
            if (permissions.audio) devices.push("audio");

            localTracks = await window.JitsiMeetJS.createLocalTracks({
                devices,
                resolution: 720,
                constraints: {
                    video: permissions.video
                        ? {
                            height: {
                                ideal: 720,
                                max: 720
                            },
                            width: {
                                ideal: 1280,
                                max: 1280
                            }
                        }
                        : false,
                    audio: permissions.audio
                        ? {
                            echoCancellation: false,
                            noiseSuppression: false,
                            autoGainControl: false
                        }
                        : false
                }
            });
            return localTracks;
        } catch (error) {
            console.error("Error creating local tracks:", error);
            throw error;
        }
    };

    const createTrackControls = () => {
        if (!Array.isArray(localTracks)) {
            console.error("Local tracks is not an array:", localTracks);
            return;
        }

        localTracks.forEach((track: any) => {
            if (track.getType() === "video") {
                const videoContainer = document.getElementById("video-container");
                if (videoContainer) {
                    const videoElement = document.createElement("video");
                    videoElement.id = "localVideo";
                    videoElement.autoplay = true;
                    videoContainer.appendChild(videoElement);
                    track.attach(videoElement);
                }
            }
            if (track.getType() === "audio") {
                const audioElement = document.createElement("audio");
                audioElement.id = "localAudio";
                audioElement.autoplay = true;
                audioElement.muted = true;
                document.body.appendChild(audioElement);
                track.attach(audioElement);
            }
        });
    };

    // Handle remote tracks
    const onRemoteTrack = (track: any) => {
        if (track.isLocal()) {
            return;
        }
        const participant = track.getParticipantId();

        if (!track.isLocal()) {
            const videoContainer =
                document.getElementById("video-container");
            if (videoContainer) {
                const video = track.attach();
                video.id = participant;
                videoContainer.appendChild(video);
            }
        }
    };

    const disposeTracks = () => {
        for (let track of localTracks) {
            track.dispose();
        }
    };

    return {
        createLocalTracks,
        localTracks,
        createTrackControls,
        onRemoteTrack,
        disposeTracks
    };
}