export const requestMediaPermissions = async () => {
    const permissions = { audio: false, video: false };

    // Try audio first
    try {
        const audioStream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
        });
        audioStream.getTracks().forEach((track) => track.stop());
        permissions.audio = true;
    } catch (error: any) {
        console.warn("Audio permission error:", error.name, error.message);
    }

    // Try video separately
    try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        videoStream.getTracks().forEach((track) => track.stop());
        permissions.video = true;
    } catch (error: any) {
        console.warn("Video permission error:", error.name, error.message);
    }

    return permissions;
};