import { jsx, Fragment } from "@/lib/template";
import { Component } from "../Component";
import { faker } from "@faker-js/faker";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { Reaction } from "./types";
import { QUICK_REACTIONS } from "./reactions";
import { createEditor } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { EmojiNode } from "@/lib/plugins/EmojiPlugin";

interface MessageProps {
    message: {
        content: any;
        sender: number;
        senderName?: string;
        timestamp: number;
        reactions?: Record<string, Reaction>;
        thread?: {
            replyCount: number;
            lastReply?: any;
            replies: any[];
        };
    };
    isCurrentUser: boolean;
    isThreadReply?: boolean;
    provider: WebsocketProvider | null;
    reactions: Y.Map<Record<string, Reaction>>;
    getCurrentUserId: () => number;
    addThreadReply: (parentTimestamp: number, replyContent: any) => void;
    container?: HTMLElement;
}

export const Message = Component({
    effect: () => {},
    render: async ({
        message,
        isCurrentUser,
        isThreadReply,
        provider,
        reactions,
        getCurrentUserId,
        addThreadReply
    }: MessageProps) => (
        <article>
            <header>
                <span>{message.senderName}</span>
            </header>
            <main>
                <section>
                    <div id={`message-${message.timestamp}`} />
                </section>
            </main>
            <footer></footer>
        </article>
    )
});
