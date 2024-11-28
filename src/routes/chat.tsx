import { jsx, Fragment } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createEditor, $getRoot, $createParagraphNode } from "lexical";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { EmojiNode, registerEmojiPlugin } from "@/lib/plugins/EmojiPlugin";
import { Profile } from "@/lib/ui/profile/Profile";
import {
    Reactions as ReactionsUtil,
    QUICK_REACTIONS
} from "@/lib/ui/chat/reactions";
import { Reaction } from "@/lib/ui/chat/types";
import { faker } from "@faker-js/faker";
import { Message } from "@/lib/ui/chat/Message";

// Define thread type
interface Thread {
    replyCount: number;
    lastReply?: ChatMessage;
    replies: ChatMessage[];
}

// Define message type
interface ChatMessage {
    content: any;
    sender: number;
    senderName?: string;
    timestamp: number;
    reactions?: Record<string, Reaction>;
    thread?: Thread;
}

// Define awareness state type
interface AwarenessState {
    user: {
        name: string;
        color: string;
    };
}

// Initialize Yjs document
const ydoc = new Y.Doc();
let provider: WebsocketProvider | null = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

// Create shared types for messages and interactions
const messages = ydoc.getArray<ChatMessage>("messages");
const reactions = ydoc.getMap<Record<string, Reaction>>("reactions");
const threads = ydoc.getMap<Thread>("threads");

// Helper to safely get current user ID
const getCurrentUserId = (): number => {
    if (!provider?.awareness) return 0;
    return provider.awareness.clientID;
};

// Helper to safely get current user state
const getCurrentUserState = (): AwarenessState["user"] | null => {
    if (!provider?.awareness) return null;
    const state = provider.awareness.getLocalState() as AwarenessState;
    return state?.user || null;
};

const addThreadReply = (parentTimestamp: number, replyContent: any) => {
    if (!provider?.wsconnected) return;

    const userState = getCurrentUserState();
    if (!userState) return;

    const thread = threads.get(parentTimestamp.toString()) || {
        replyCount: 0,
        replies: []
    };

    const reply: ChatMessage = {
        content: replyContent,
        sender: getCurrentUserId(),
        senderName: userState.name,
        timestamp: Date.now()
    };

    thread.replies.push(reply);
    thread.replyCount = thread.replies.length;
    thread.lastReply = reply;

    // Update the Yjs map
    threads.set(parentTimestamp.toString(), thread);
};

// Connection status management
const ConnectionState = {
    CONNECTING: "connecting",
    CONNECTED: "connected",
    DISCONNECTED: "disconnected",
    RECONNECTING: "reconnecting",
    FAILED: "failed"
} as const;

type ConnectionState = (typeof ConnectionState)[keyof typeof ConnectionState];

// Near the top of the file, update the Reactions interface/type
interface ReactionProps {
    provider: WebsocketProvider | null;
    reactions: Y.Map<Record<string, Reaction>>; // Change from YMap to Y.Map
    getCurrentUserId: () => number;
}

// Update the Reactions function signature
const ReactionHandler = ({
    provider,
    reactions,
    getCurrentUserId
}: ReactionProps) => {
    const addReaction = (
        messageId: number,
        reactionKey: string,
        target: HTMLElement
    ) => {
        if (!provider) return;
        // ... rest of the function
    };

    return { addReaction };
};

export const render = Component({
    effect: () => {},
    render: () => (
        <div class="row height">
            <div class="members-panel">
                {[...Array(10)].map(() => (
                    <Profile />
                ))}
            </div>
            <div class="chat-container grow">
                <div class="connection-status"></div>
                <span class="material-icons start-videocall pointer">
                    videocam
                </span>
                <div id="messages-container" class="scroll"></div>
                <div class="input-container">
                    <div class="editor-wrapper">
                        <div id="lexical-editor" contenteditable></div>
                        <div class="input-actions">
                            <span class="material-icons action-button pointer">
                                add_photo_alternate
                            </span>
                            <span class="material-icons action-button pointer">
                                mic
                            </span>
                            <span class="material-icons action-button pointer">
                                mood
                            </span>
                            <div class="grow"></div>
                            <span class="material-icons send-button pointer">
                                send
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
});
