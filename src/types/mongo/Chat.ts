export type Chat = {
    _id: string
    _t: string
    Created: string
    Updated: string
    Deleted: any
    _Etag: string
    GroupId: any
    Name: string
    ImageURL: any
    Participants: Array<{
        _id: string
        Created: string
        Updated: string
        Deleted: any
        _Etag: any
        UserId: string
    }>
    LastMessage: {
        _id: string
        Created: string
        Updated: string
        Deleted: any
        _Etag: string
        ChatId: string
        UserId: string
        Text: string
        ImageURL: any
        VideoURL: any
        DocumentURL: any
        CallToAction: any
        Type: number
    }
    LastReadTime: string
    UnreadMessages: number
}