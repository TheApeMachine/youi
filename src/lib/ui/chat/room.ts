export const Room = (roomName: string, confOptions: any, onRemoteTrack: any) => {
    let room: any;

    const initRoom = (connection: any) => {
        room = connection.initJitsiConference(
            roomName,
            confOptions
        );

        room.on(
            window.JitsiMeetJS.events.conference.TRACK_ADDED,
            onRemoteTrack
        );

        room.on(
            window.JitsiMeetJS.events.conference.CONFERENCE_JOINED,
            () => {
                console.log("Conference joined");
            }
        );

        return room;
    };

    const leave = () => {
        if (room) {
            room.leave();
        }
    };

    return { initRoom, leave };
};
