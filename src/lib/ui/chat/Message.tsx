import { jsx } from "@/lib/vdom";
import { createEditor } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { EmojiNode } from "@/lib/plugins/EmojiPlugin";
import { Column } from "@/lib/ui/Flex";
import { Text } from "@/lib/ui/Text";
import { Message as MessageType } from "@/types/mongo/Message";
import { from } from "@/lib/mongo/query";
import { User } from "@/types/mongo/User";
import { Avatar } from "../profile/Avatar";

export const Message = async (props: { message: MessageType }) => {
    const user = (await from("User")
        .where({ _id: props.message.UserId })
        .limit(1)
        .exec()) as User[];

    const formatMessage = (text: string) => {
        return text.split("\n").map((line, i) => (
            <Text variant="span" color="text">
                {line}
            </Text>
        ));
    };

    const onMount = () => {
        const messageId = `message-${props.message.Created}`;

        requestAnimationFrame(() => {
            const contentElement = document.getElementById(messageId);
            if (!contentElement) return;

            const editor = createEditor({
                namespace: "chat-message",
                nodes: [HeadingNode, QuoteNode, EmojiNode],
                editable: false,
                onError: (error: Error) => {
                    console.error("Message editor error:", error);
                }
            });

            editor.setRootElement(contentElement);

            try {
                const editorState = editor.parseEditorState(props.message.Text);
                editor.setEditorState(editorState);
            } catch (error) {
                console.error("Failed to parse message content:", error);
                contentElement.textContent = props.message.Text ?? "";
            }
        });
    };

    return (
        <Column className="message" pad="md" background="bg">
            <Avatar
                src={props.message.User.ImageURL + "?w=100"}
                size="sm"
                radius="sm"
                background="bg-offset"
            />
            <Text variant="span" color="text-primary">
                {user?.[0]?.FirstName || "Unknown User"}
            </Text>
            <Text variant="span" color="text-offset">
                {formatMessage(props.message.Text)}
            </Text>
        </Column>
    );
};
