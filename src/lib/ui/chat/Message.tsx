import { jsx, Fragment } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Reactions, QUICK_REACTIONS } from "./reactions";
import { ChatMessage, Thread, Reaction, AwarenessState } from "./types";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { createEditor } from "lexical";
import { EmojiNode } from "@/lib/plugins/EmojiPlugin";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

const ydoc = new Y.Doc();
let provider: WebsocketProvider | null = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

// Create shared types for messages and interactions
const messages = ydoc.getArray<ChatMessage>("messages");
const reactions = ydoc.getMap<Record<string, Reaction>>("reactions");
const threads = ydoc.getMap<Thread>("threads");

const getCurrentUserId = (): number => {
    if (!provider?.awareness) return 0;
    return provider.awareness.clientID;
};

// Helper to safely get current user state
const getCurrentUserState = (): AwarenessState['user'] | null => {
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

export const Message = Component<{
    message: ChatMessage;
    isCurrentUser: boolean;
    isThreadReply?: boolean;
}>({
    effect: ({ message, isCurrentUser, isThreadReply = false }: {
        message: ChatMessage;
        isCurrentUser: boolean;
        isThreadReply?: boolean;
    }) => {
        const {handleReaction} = Reactions()
        const displayName = isCurrentUser ? "You" : message.senderName || `User ${message.sender}`;
        const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const { addReaction } = Reactions({ provider, reactions, getCurrentUserId });
        // Get reactions for this message
        const messageReactions = reactions.get(message.timestamp.toString()) || {};
        const activeReactions = Object.entries(messageReactions)
            .map(([key, reaction]) => ({
                emoji: QUICK_REACTIONS.find(r => r.key === key)?.emoji || key,
                count: reaction.count,
                active: reaction.users.includes(getCurrentUserId())
            }))
            .filter(r => r.count > 0);

        // Get thread for this message
        const thread = threads.get(message.timestamp.toString());

        // Event handler type
        type ReactionHandler = (key: string, event: Event & { currentTarget: HTMLElement }) => void;

        // Handlers
        const handleReaction: ReactionHandler = (reactionKey, event) => {
            addReaction(message.timestamp, reactionKey, event.currentTarget);
        };

        const showThreadInput = () => {
            const messageElement = document.querySelector(`[data-message-id="${message.timestamp}"]`);
            if (!messageElement) return;

            let threadContainer = messageElement.querySelector('.thread-container');
            if (!threadContainer) {
                threadContainer = document.createElement('div');
                threadContainer.className = 'thread-container';
                messageElement.querySelector('.message-content')?.appendChild(threadContainer);
            }

            // Only add input if it doesn't exist
            if (!threadContainer.querySelector('.thread-input')) {
                const threadInput = document.createElement('div');
                threadInput.className = 'thread-input';

                // Create Lexical editor for thread reply
                const editor = createEditor({
                    namespace: `thread-${message.timestamp}`,
                    nodes: [HeadingNode, QuoteNode, EmojiNode],
                    editable: true,
                    onError: (error: Error) => {
                        throw error;
                    }
                });

                const editorDiv = document.createElement('div');
                editorDiv.className = 'lexical-editor';
                threadInput.appendChild(editorDiv);

                const sendButton = document.createElement('span');
                sendButton.className = 'material-icons send-button pointer';
                sendButton.textContent = 'send';
                sendButton.onclick = () => {
                    editor.getEditorState().read(() => {
                        const content = editor.getEditorState().toJSON();
                        if (content) {
                            addThreadReply(message.timestamp, content);
                            editor.setEditorState(editor.parseEditorState(''));
                        }
                    });
                };
                threadInput.appendChild(sendButton);

                threadContainer.appendChild(threadInput);
                editor.setRootElement(editorDiv);
            };
        },
            render: () => (
                <div
            class= {`message ${isCurrentUser ? 'outgoing' : ''} ${isThreadReply ? 'thread-reply' : ''}`
    }
            data- sender={ message.sender }
            data - message - id={ message.timestamp }
            style = {`--prev-sender: ${message.sender}`}
            >
            <img
                class="message-avatar"
                src={`https://api.dicebear.com/7.x/avatars/svg?seed=${message.sender}`}
                alt={displayName}
            />
            <div class="message-content">
                <div class="message-header">
                    <span>{displayName}</span>
                    <span class="message-time">{time}</span>
                </div>
                <div class="lexical-content" id={`message-${message.timestamp}`}></div>

                {!isThreadReply && (
                    <>
                        <div class="quick-reactions">
                            {QUICK_REACTIONS.map(({ emoji, key }) => (
                                <span
                                    class="quick-reaction"
                                    title={key}
                                    data-reaction={key}
                                    onclick={(e: Event) => handleReaction(key, e as Event & { currentTarget: HTMLElement })}
                                >
                                    {emoji}
                                </span>
                            ))}
                            <span class="quick-reaction material-icons">add</span>
                        </div>

                        <div class="message-actions">
                            <span class="material-icons message-action" title="React">add_reaction</span>
                            <span
                                class="material-icons message-action"
                                title="Reply in Thread"
                                onclick={showThreadInput}
                            >
                                chat
                            </span>
                            <span class="material-icons message-action" title="More">more_vert</span>
                        </div>

                        {activeReactions.length > 0 && (
                            <div class="message-reactions">
                                {activeReactions.map(({ emoji, count, active }) => (
                                    <div
                                        class={`reaction ${active ? 'active' : ''}`}
                                        onclick={(e: Event) => handleReaction(emoji, e as Event & { currentTarget: HTMLElement })}
                                    >
                                        {emoji} <span class="reaction-count">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {thread && thread.replyCount > 0 && (
                            <div class="thread-container">
                                <div class="thread-reply-count">
                                    <span class="material-icons">chat</span>
                                    <span class="thread-count">
                                        {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                                    </span>
                                </div>
                                <div class="thread-replies">
                                    {thread.replies.slice(-2).map(reply => (
                                        <Message
                                            message={reply}
                                            isCurrentUser={reply.sender === getCurrentUserId()}
                                            isThreadReply={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div >
    );
});
