export interface Reaction {
    emoji: string;
    count: number;
    users: number[]; // Array of user IDs who reacted
}

export interface Thread {
    replyCount: number;
    lastReply?: ChatMessage;
    replies: ChatMessage[];
}

export interface ChatMessage {
    content: any;
    sender: number;
    senderName?: string;
    timestamp: number;
    reactions?: Record<string, Reaction>;
    thread?: Thread;
}

export interface AwarenessState {
    user: {
        name: string;
        color: string;
    };
}
