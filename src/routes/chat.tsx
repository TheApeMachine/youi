import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createEditor, $getRoot, $createParagraphNode } from "lexical";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

// Initialize Yjs document
const ydoc = new Y.Doc();
let provider: WebsocketProvider | null = null;
let connectionAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 3000;

// Create a shared type for messages
const messages = ydoc.getArray("messages");

// Connection status management
const ConnectionState = {
    CONNECTING: "connecting",
    CONNECTED: "connected",
    DISCONNECTED: "disconnected",
    RECONNECTING: "reconnecting",
    FAILED: "failed"
} as const;

type ConnectionState = (typeof ConnectionState)[keyof typeof ConnectionState];

export const render = Component({
    effect: () => {
        // Initialize input editor
        const editorRef = document.getElementById(
            "lexical-editor"
        ) as HTMLElement;

        const initialConfig = {
            namespace: "chat",
            nodes: [HeadingNode, QuoteNode],
            onError: (error: Error) => {
                throw error;
            }
        };

        const editor = createEditor(initialConfig);
        editor.setRootElement(editorRef);

        // Register Lexical plugins
        mergeRegister(
            registerRichText(editor),
            registerHistory(editor, createEmptyHistoryState(), 300)
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
                    "ws://localhost:1234",
                    "chat-room",
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
                        sender: currentProvider.awareness.clientID
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
        const renderMessage = (message: any) => {
            const messageDiv = document.createElement("div");
            messageDiv.className = `message ${
                message.sender === provider?.awareness.clientID
                    ? "sent"
                    : "received"
            }`;

            const messageContent = document.createElement("div");
            messageContent.className = "message-content";
            messageDiv.appendChild(messageContent);

            const messageEditor = createEditor({
                ...initialConfig,
                editable: false
            });

            messageEditor.setRootElement(messageContent);
            messageEditor.setEditorState(
                editor.parseEditorState(message.content)
            );

            const timestamp = document.createElement("div");
            timestamp.className = "message-timestamp";
            timestamp.textContent = new Date(
                message.timestamp
            ).toLocaleString();
            messageDiv.appendChild(timestamp);

            messagesContainer?.appendChild(messageDiv);
            messagesContainer?.scrollTo(0, messagesContainer.scrollHeight);
        };

        // Render existing messages
        messages.forEach(renderMessage);

        // Observe new messages
        messages.observe(() => {
            const lastMessage = messages.get(messages.length - 1);
            if (lastMessage) {
                renderMessage(lastMessage);
            }
        });

        // Clean up on disconnect
        return () => {
            provider?.disconnect();
            ydoc.destroy();
        };
    },
    render: async () => (
        <div class="chat-container column">
            <div class="connection-info">
                <div id="connection-status" class="status status-connecting">
                    CONNECTING
                </div>
                <div id="connection-message" class="status-message"></div>
            </div>
            <div id="messages-container" class="messages-container">
                {/* Messages will be rendered here */}
            </div>
            <div class="editor-wrapper row">
                <div id="lexical-editor" contenteditable></div>
                <span class="material-icons send-button">send</span>
            </div>
        </div>
    )
});
