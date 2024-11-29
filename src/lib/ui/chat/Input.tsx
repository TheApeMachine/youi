import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createEditor, $getRoot } from "lexical";
import { EmojiNode, registerEmojiPlugin } from "@/lib/plugins/EmojiPlugin";
import { eventBus } from "@/lib/event";

interface InputProps {}

export const Input = Component<InputProps>({
    effect: () => {
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

        mergeRegister(
            registerRichText(editor),
            registerHistory(editor, createEmptyHistoryState(), 300),
            registerEmojiPlugin(editor)
        );

        editorRef?.addEventListener("keydown", (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();

                editor.getEditorState().read(() => {
                    const root = $getRoot();

                    if (root.getTextContent().trim()) {
                        const message = {
                            detail: {
                                content: editor.getEditorState().toJSON(),
                                timestamp: Date.now(),
                                sender: "Anonymous",
                                senderName: "Anonymous"
                            }
                        };

                        if (!message.detail.content) {
                            eventBus.publish(
                                "status",
                                new CustomEvent("status", {
                                    detail: {
                                        status: "error",
                                        title: "Validation Error",
                                        message: "Message cannot be empty"
                                    }
                                })
                            );
                            return;
                        }

                        eventBus.publish(
                            "send-message",
                            new CustomEvent("send-message")
                        );
                    }
                });
            }
        });
    },
    render: () => (
        <div class="column">
            <div class="row grow center pad-xs">
                <div
                    id="lexical-editor"
                    class="row grow width"
                    contenteditable
                ></div>
                <span
                    id="send-button"
                    data-trigger="click"
                    data-effect="send-message"
                    class="material-icons send-button pointer pad pink"
                >
                    send
                </span>
            </div>
            <div class="row width left border-top radius-bottom-xs bg-darker">
                <span class="material-icons action-button pointer pad">
                    add_photo_alternate
                </span>
                <span class="material-icons action-button pointer pad">
                    mic
                </span>
                <span class="material-icons action-button pointer pad">
                    mood
                </span>
            </div>
        </div>
    )
});
