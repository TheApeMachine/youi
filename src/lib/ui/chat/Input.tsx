import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createEditor, $getRoot } from "lexical";
import { EmojiNode, registerEmojiPlugin } from "@/lib/plugins/EmojiPlugin";
import { eventBus } from "@/lib/event";
import { stateManager } from "@/lib/state";
import { from } from "@/lib/mongo/query";
import { Flex } from "../Flex";
import { Button } from "../button/Button";
import { Popover } from "../Popover";

export const Input = Component({
    effect: () => {
        const { user } = stateManager.getState("user");
        let userData: any | null = null;
        from("User")
            .where({ Auth0UserId: user?.sub })
            .exec()
            .then((data) => {
                userData = data[0];
            });

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
                                sender: userData?._id,
                                senderName: userData?.FirstName,
                                senderAvatar: userData?.ImageURL
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
                            new CustomEvent("send-message", message)
                        );
                    }
                });
            }
        });
    },
    render: ({ variant }: { variant: "chat" | "timeline" }) => (
        <Flex justify="space-between" fullWidth>
            <Flex id="lexical-editor" fullWidth contentEditable></Flex>
            <Button variant="icon" color="muted" icon="send" />
        </Flex>
    )
});
