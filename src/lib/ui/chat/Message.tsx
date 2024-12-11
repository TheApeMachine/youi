import { jsx } from "@/lib/template";
import { WebsocketProvider } from "y-websocket";
import * as Y from "yjs";
import { createEditor } from "lexical";
import { Reaction } from "./types";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { EmojiNode } from "@/lib/plugins/EmojiPlugin";
import { Flex } from "@/lib/ui/Flex";
import { Image } from "@/lib/ui/Image";
import { Text } from "@/lib/ui/Text";

interface MessageProps {
    message: {
        content: any;
        sender: number;
        senderName?: string;
        senderAvatar?: string;
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

export const Message = () => {
    const onMount = () => {
        const messageId = `message-${props.message.timestamp}`;

        // Wait for the content element to be available
        requestAnimationFrame(() => {
            const contentElement = document.getElementById(messageId);
            if (!contentElement) return;

            const editor = createEditor({
                namespace: "chat-message",
                nodes: [HeadingNode, QuoteNode, EmojiNode],
                editable: false, // Read-only mode
                onError: (error: Error) => {
                    console.error("Message editor error:", error);
                }
            });

            editor.setRootElement(contentElement);

            try {
                // Parse and set the editor state from the stored content
                const editorState = editor.parseEditorState(
                    props.message.content
                );
                editor.setEditorState(editorState);
            } catch (error) {
                console.error("Failed to parse message content:", error);
                // Fallback to displaying raw content if parsing fails
                contentElement.textContent =
                    props.message.content?.toString() ?? "";
            }
        });
    };

    return (
        <Flex
            direction="column"
            alignSelf="start"
            background="transparent"
            gradient="dark"
            pad="md"
            radius="xs"
            className={`message ${props.isCurrentUser ? "message-self" : ""}`}
        >
            <Flex gap="unit" align="start" background="transparent">
                <Image
                    alt={props.message.senderName}
                    className="avatar"
                    src={props.message.senderAvatar ?? ""}
                />
                <Flex
                    direction="column"
                    gap="unit"
                    background="transparent"
                    fullWidth
                >
                    <Flex
                        justify="space-between"
                        background="transparent"
                        align="center"
                    >
                        <Text variant="h6">
                            {props.message.senderName ?? ""}
                        </Text>
                        <Text variant="sub">
                            {new Date(
                                props.message.timestamp
                            ).toLocaleString() ?? ""}
                        </Text>
                    </Flex>
                    <Flex
                        className="message-content"
                        background="transparent"
                        pad="sm"
                        radius="xs"
                    >
                        <div
                            id={`message-${props.message.timestamp}`}
                            className="lexical-content"
                        />
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};
