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
import { Reactions, QUICK_REACTIONS } from "@/lib/ui/chat/reactions";
import { Reaction } from "@/lib/ui/chat/types";
import { faker } from "@faker-js/faker";

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

// Message component with interaction handlers
const Message = ({
    message,
    isCurrentUser,
    isThreadReply = false
}: {
    message: ChatMessage;
    isCurrentUser: boolean;
    isThreadReply?: boolean;
}) => {
    const { addReaction } = Reactions({
        provider,
        reactions,
        getCurrentUserId
    });
    const displayName = isCurrentUser
        ? "You"
        : message.senderName || `User ${message.sender}`;
    const time = new Date(message.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    // Get reactions for this message
    const messageReactions = reactions.get(message.timestamp.toString()) || {};
    const activeReactions = Object.entries(messageReactions)
        .map(([key, reaction]) => ({
            emoji: QUICK_REACTIONS.find((r) => r.key === key)?.emoji || key,
            count: reaction.count,
            active: reaction.users.includes(getCurrentUserId())
        }))
        .filter((r) => r.count > 0);

    // Get thread for this message
    const thread = threads.get(message.timestamp.toString());

    // Event handler type
    type ReactionHandler = (
        key: string,
        event: Event & { currentTarget: HTMLElement }
    ) => void;

    // Handlers
    const handleReaction: ReactionHandler = (reactionKey, event) => {
        addReaction(message.timestamp, reactionKey, event.currentTarget);
    };

    const showThreadInput = () => {
        const messageElement = document.querySelector(
            `[data-message-id="${message.timestamp}"]`
        );
        if (!messageElement) return;

        let threadContainer = messageElement.querySelector(".thread-container");
        if (!threadContainer) {
            threadContainer = document.createElement("div");
            threadContainer.className = "thread-container";
            messageElement
                .querySelector(".message-content")
                ?.appendChild(threadContainer);
        }

        // Only add input if it doesn't exist
        if (!threadContainer.querySelector(".thread-input")) {
            const threadInput = document.createElement("div");
            threadInput.className = "thread-input";

            // Create Lexical editor for thread reply
            const editor = createEditor({
                namespace: `thread-${message.timestamp}`,
                nodes: [HeadingNode, QuoteNode, EmojiNode],
                editable: true,
                onError: (error: Error) => {
                    throw error;
                }
            });

            const editorDiv = document.createElement("div");
            editorDiv.className = "lexical-editor";
            threadInput.appendChild(editorDiv);

            const sendButton = document.createElement("span");
            sendButton.className = "material-icons send-button pointer";
            sendButton.textContent = "send";
            sendButton.onclick = () => {
                editor.getEditorState().read(() => {
                    const content = editor.getEditorState().toJSON();
                    if (content) {
                        addThreadReply(message.timestamp, content);
                        editor.setEditorState(editor.parseEditorState(""));
                    }
                });
            };
            threadInput.appendChild(sendButton);

            threadContainer.appendChild(threadInput);
            editor.setRootElement(editorDiv);
        }
    };

    return (
        <div
            class={`message ${isCurrentUser ? "outgoing" : ""} ${
                isThreadReply ? "thread-reply" : ""
            }`}
            data-sender={message.sender}
            data-message-id={message.timestamp}
            style={`--prev-sender: ${message.sender}`}
        >
            <div class="row left avatar-container">
                <img
                    class="message-avatar"
                    src={faker.image.avatar()}
                    alt={displayName}
                />
                <div class="status online"></div>
            </div>

            <div class="message-content">
                <div class="message-header">
                    <span>{displayName}</span>
                    <span class="message-time">{time}</span>
                </div>
                <div
                    class="lexical-content"
                    id={`message-${message.timestamp}`}
                ></div>

                {!isThreadReply && (
                    <Fragment>
                        {/* Quick Reactions */}
                        <div class="quick-reactions">
                            {QUICK_REACTIONS.map(({ emoji, key }) => (
                                <span
                                    class="quick-reaction"
                                    title={key}
                                    data-reaction={key}
                                    onclick={(e: Event) =>
                                        handleReaction(
                                            key,
                                            e as Event & {
                                                currentTarget: HTMLElement;
                                            }
                                        )
                                    }
                                >
                                    {emoji}
                                </span>
                            ))}
                            <span class="quick-reaction material-icons">
                                add
                            </span>
                        </div>

                        {/* Message Actions */}
                        <div class="message-actions">
                            <span
                                class="material-icons message-action"
                                title="React"
                            >
                                add_reaction
                            </span>
                            <span
                                class="material-icons message-action"
                                title="Reply in Thread"
                                onclick={showThreadInput}
                            >
                                chat
                            </span>
                            <span
                                class="material-icons message-action"
                                title="More"
                            >
                                more_vert
                            </span>
                        </div>

                        {/* Active Reactions */}
                        {activeReactions.length > 0 && (
                            <div class="message-reactions">
                                {activeReactions.map(
                                    ({ emoji, count, active }) => (
                                        <div
                                            class={`reaction ${
                                                active ? "active" : ""
                                            }`}
                                            onclick={(e: Event) =>
                                                handleReaction(
                                                    emoji,
                                                    e as Event & {
                                                        currentTarget: HTMLElement;
                                                    }
                                                )
                                            }
                                        >
                                            {emoji}{" "}
                                            <span class="reaction-count">
                                                {count}
                                            </span>
                                        </div>
                                    )
                                )}
                            </div>
                        )}

                        {/* Thread Preview */}
                        {thread && thread.replyCount > 0 && (
                            <div class="thread-container">
                                <div class="thread-reply-count">
                                    <span class="material-icons">chat</span>
                                    <span class="thread-count">
                                        {thread.replyCount}{" "}
                                        {thread.replyCount === 1
                                            ? "reply"
                                            : "replies"}
                                    </span>
                                </div>
                                <div class="thread-replies">
                                    {thread.replies.slice(-2).map((reply) => (
                                        <Message
                                            message={reply}
                                            isCurrentUser={
                                                reply.sender ===
                                                getCurrentUserId()
                                            }
                                            isThreadReply={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </Fragment>
                )}
            </div>
        </div>
    );
};

export const render = Component({
    effect: () => {
        // Initialize input editor
        const editorRef = document.getElementById(
            "lexical-editor"
        ) as HTMLElement;

        const initialConfig = {
            namespace: "chat",
            nodes: [HeadingNode, QuoteNode, EmojiNode],
            onError: (error: Error) => {
                throw error;
            }
        };

        const editor = createEditor(initialConfig);
        editor.setRootElement(editorRef);

        // Register Lexical plugins
        mergeRegister(
            registerRichText(editor),
            registerHistory(editor, createEmptyHistoryState(), 300),
            registerEmojiPlugin(editor)
        );

        // Connection management
        const updateStatus = (state: ConnectionState, message?: string) => {
            const statusEl = document.querySelector(".connection-status");
            if (!statusEl) return;

            statusEl.className = `connection-status visible status-${state}`;
            statusEl.textContent = message || state.toUpperCase();

            // Auto-hide success status after 3 seconds
            if (state === "connected") {
                setTimeout(() => {
                    statusEl.classList.remove("visible");
                }, 3000);
            }

            // Update editor state
            const editorWrapper = document.querySelector(
                ".editor-wrapper"
            ) as HTMLElement;
            if (editorWrapper) {
                editorWrapper.style.opacity =
                    state === "connected" ? "1" : "0.5";
                editorRef.contentEditable =
                    state === "connected" ? "true" : "false";
            }
        };

        const initializeProvider = () => {
            try {
                updateStatus(ConnectionState.CONNECTING);

                provider = new WebsocketProvider(
                    "wss://crdt.fanfactory.io/collaboration",
                    "playground/0/0",
                    ydoc,
                    { connect: true }
                );

                provider.on("status", ({ status }: { status: string }) => {
                    switch (status) {
                        case "connected":
                            connectionAttempts = 0;
                            updateStatus(ConnectionState.CONNECTED);
                            break;
                        case "disconnected":
                            handleDisconnect();
                            break;
                    }
                });

                provider.on("connection-error", (event: Event) => {
                    console.error("Connection error:", event);
                    handleDisconnect();
                });

                // Update awareness state
                provider.awareness.setLocalStateField("user", {
                    name: `User ${Math.floor(Math.random() * 1000)}`,
                    color: `#${Math.floor(Math.random() * 16777215).toString(
                        16
                    )}`
                });
            } catch (error) {
                console.error("Failed to initialize provider:", error);
                handleDisconnect();
            }
        };

        const handleDisconnect = () => {
            if (connectionAttempts >= MAX_RECONNECT_ATTEMPTS) {
                updateStatus(
                    ConnectionState.FAILED,
                    `Connection failed after ${MAX_RECONNECT_ATTEMPTS} attempts. Please try again later.`
                );
                return;
            }

            connectionAttempts++;
            updateStatus(
                ConnectionState.RECONNECTING,
                `Connection lost. Attempting to reconnect (${connectionAttempts}/${MAX_RECONNECT_ATTEMPTS})...`
            );

            setTimeout(() => {
                provider?.disconnect();
                initializeProvider();
            }, RECONNECT_INTERVAL);
        };

        // Initialize connection
        initializeProvider();

        // Add a hardcoded username for now
        const currentUser = {
            id: provider?.awareness?.clientID,
            name: "Current User" // We can make this configurable later
        };

        // Handle send button click and Enter key
        const sendMessage = () => {
            if (!provider || provider.wsconnected === false) {
                updateStatus(
                    ConnectionState.DISCONNECTED,
                    "Cannot send message: Not connected to server"
                );
                return;
            }

            const currentProvider = provider;
            editor.getEditorState().read(() => {
                const root = $getRoot();
                if (root.getTextContent().trim()) {
                    const message = {
                        content: editor.getEditorState().toJSON(),
                        timestamp: Date.now(),
                        sender: currentProvider.awareness.clientID,
                        senderName: currentUser.name
                    };
                    messages.push([message]);

                    editor.update(() => {
                        const root = $getRoot();
                        root.clear();
                        root.append($createParagraphNode());
                    });
                }
            });
        };

        const sendButton = document.querySelector(
            ".send-button"
        ) as HTMLElement;
        sendButton?.addEventListener("click", sendMessage);

        editorRef?.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Message rendering logic
        const messagesContainer = document.getElementById("messages-container");
        let userHasScrolled = false;
        let isNearBottom = true;

        const checkNearBottom = () => {
            if (!messagesContainer) return true;
            const threshold = 100;
            const position =
                messagesContainer.scrollHeight -
                messagesContainer.scrollTop -
                messagesContainer.clientHeight;
            return position < threshold;
        };

        messagesContainer?.addEventListener("scroll", () => {
            userHasScrolled = true;
            isNearBottom = checkNearBottom();
        });

        const scrollToBottom = (force = false) => {
            if (!messagesContainer) return;
            if (force || !userHasScrolled || isNearBottom) {
                requestAnimationFrame(() => {
                    messagesContainer.scrollTop =
                        messagesContainer.scrollHeight;
                });
            }
        };

        // Render all messages when they change
        const renderAllMessages = () => {
            if (!messagesContainer) return;

            const wasAtBottom = checkNearBottom();
            messagesContainer.innerHTML = "";

            Promise.all(
                messages.toArray().map((message: ChatMessage) => {
                    const isCurrentUser = message.sender === currentUser.id;
                    const messageElement = Message({ message, isCurrentUser });
                    messagesContainer.appendChild(messageElement);

                    // Initialize Lexical editor for the message content
                    const contentElement = document.getElementById(
                        `message-${message.timestamp}`
                    );
                    if (contentElement) {
                        const messageEditor = createEditor({
                            ...initialConfig,
                            editable: false
                        });
                        messageEditor.setRootElement(contentElement);
                        messageEditor.setEditorState(
                            messageEditor.parseEditorState(message.content)
                        );
                    }

                    return Promise.resolve();
                })
            ).then(() => {
                scrollToBottom(wasAtBottom);
            });
        };

        // Initial render
        renderAllMessages();

        // Observe changes to messages
        messages.observe(renderAllMessages);

        // Clean up
        return () => {
            provider?.disconnect();
            ydoc.destroy();
        };
    },
    render: async () => (
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
