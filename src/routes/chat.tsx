import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createEditor, $getRoot, $createParagraphNode } from "lexical";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { Post } from "@/lib/ui/monocle/Post";
import { EmojiNode, registerEmojiPlugin } from "@/lib/plugins/EmojiPlugin";

// Define message type
interface ChatMessage {
    content: any;
    sender: number;
    senderName?: string;
    timestamp: number;
}

// Initialize Yjs document
const ydoc = new Y.Doc();
let provider: WebsocketProvider | null = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

// Create a shared type for messages
const messages = ydoc.getArray<ChatMessage>("messages");

// Connection status management
const ConnectionState = {
    CONNECTING: "connecting",
    CONNECTED: "connected",
    DISCONNECTED: "disconnected",
    RECONNECTING: "reconnecting",
    FAILED: "failed"
} as const;

type ConnectionState = (typeof ConnectionState)[keyof typeof ConnectionState];
import { Profile } from "@/lib/ui/profile/Profile";

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
            const statusEl = document.getElementById("connection-status");
            const statusMessageEl =
                document.getElementById("connection-message");
            const editorWrapper = document.querySelector(
                ".editor-wrapper"
            ) as HTMLElement;

            if (statusEl && statusMessageEl && editorWrapper) {
                statusEl.className = `status status-${state}`;
                statusEl.textContent = state.toUpperCase();

                if (message) {
                    statusMessageEl.textContent = message;
                    statusMessageEl.style.display = "block";
                } else {
                    statusMessageEl.style.display = "none";
                }

                // Disable editor when not connected
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
                    "ws://localhost:3000/collaboration",
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

        // Handle send button click
        const sendButton = document.querySelector(
            ".send-button"
        ) as HTMLElement;
        sendButton.addEventListener("click", () => {
            if (!provider || provider.wsconnected === false) {
                updateStatus(
                    ConnectionState.DISCONNECTED,
                    "Cannot send message: Not connected to server"
                );
                return;
            }

            // At this point, provider is guaranteed to be non-null
            const currentProvider = provider;
            editor.getEditorState().read(() => {
                const root = $getRoot();
                if (root.getTextContent().trim()) {
                    const message = {
                        content: editor.getEditorState().toJSON(),
                        timestamp: Date.now(),
                        sender: currentProvider.awareness.clientID,
                        senderName: currentUser.name // Add the sender name
                    };
                    messages.push([message]);

                    editor.update(() => {
                        const root = $getRoot();
                        root.clear();
                        root.append($createParagraphNode());
                    });
                }
            });
        });

        // Message rendering logic (unchanged)
        const messagesContainer = document.getElementById("messages-container");
        let userHasScrolled = false;
        let isNearBottom = true;

        // Check if user is near bottom of container
        const checkNearBottom = () => {
            if (!messagesContainer) return true;
            const threshold = 100; // pixels from bottom to consider "near bottom"
            const position =
                messagesContainer.scrollHeight -
                messagesContainer.scrollTop -
                messagesContainer.clientHeight;
            return position < threshold;
        };

        // Handle scroll events
        messagesContainer?.addEventListener("scroll", () => {
            userHasScrolled = true;
            isNearBottom = checkNearBottom();
        });

        // Smart scroll to bottom
        const scrollToBottom = (force = false) => {
            if (!messagesContainer) return;

            // Always scroll if forced, otherwise check conditions
            if (force || !userHasScrolled || isNearBottom) {
                // Use requestAnimationFrame to ensure DOM is ready
                requestAnimationFrame(() => {
                    messagesContainer.scrollTop =
                        messagesContainer.scrollHeight;
                });
            }
        };

        // Clear existing messages first
        if (messagesContainer) {
            messagesContainer.innerHTML = "";
        }

        // Render all messages when they change
        const renderAllMessages = () => {
            if (messagesContainer) {
                const wasAtBottom = checkNearBottom();
                messagesContainer.innerHTML = "";

                // Use Promise.all to wait for all messages to render
                Promise.all(
                    messages.toArray().map(
                        (message: ChatMessage) =>
                            new Promise<void>((resolve) => {
                                const messageDiv =
                                    document.createElement("div");
                                messageDiv.className = "message";

                                const isCurrentUser =
                                    message.sender === currentUser.id;
                                const displayName = isCurrentUser
                                    ? currentUser.name
                                    : message.senderName ||
                                      `User ${message.sender}`;

                                Post({
                                    content: message.content,
                                    sender: displayName,
                                    timestamp: message.timestamp
                                }).then((post: HTMLElement) => {
                                    messageDiv.appendChild(post);
                                    messagesContainer?.appendChild(messageDiv);
                                    resolve();
                                });
                            })
                    )
                ).then(() => {
                    scrollToBottom(wasAtBottom);
                });
            }
        };

        // Initial render
        renderAllMessages();

        // Observe changes to messages
        messages.observe(renderAllMessages);

        // Clean up on disconnect
        return () => {
            provider?.disconnect();
            ydoc.destroy();
        };
    },
    render: async () => (
        <div class="row pad-lg gap height">
            <div class="column height pad shrink bg-dark radius">
                {[...Array(10)].map(() => (
                    <Profile />
                ))}
            </div>
            <div class="column height pad-lg bg-dark radius grow">
                <span class="material-icons start-videocall pointer">
                    videocam
                </span>
                <div class="column height">
                    <div id="messages-container" class="column grow scroll">
                        <div class="info">
                            <h2>Connection</h2>
                            <div
                                id="connection-message"
                                class="status-message"
                            ></div>
                        </div>
                    </div>
                    <div class="column shrink bg-lighter ring radius-sm">
                        <div class="editor-wrapper row space-between pad gap bg-lighter radius-top-sm">
                            <div
                                id="lexical-editor"
                                class="row pad bg-lighter grow"
                                contenteditable
                            ></div>
                            <span class="material-icons send-button pointer shrink">
                                send
                            </span>
                        </div>
                        <div class="row pad gap bg-lighter radius-bottom-sm">
                            <span class="material-icons pointer">add</span>
                            <span class="material-icons pointer">mic</span>
                            <span class="material-icons pointer">videocam</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
});
