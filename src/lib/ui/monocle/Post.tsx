import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEditor } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { EmojiNode, registerEmojiPlugin } from "@/lib/plugins/EmojiPlugin";
import { Flex } from "../Flex";
import { Image } from "../Image";
import { Text } from "../Text";
import { Icon } from "../Icon";

export const Post = Component({
    effect: (item: any) => {
        // Create a unique ID for this post's content
        const postId = `post-${item._id}`;
        const contentDiv = document.getElementById(postId) as HTMLElement;
        if (!contentDiv || !item.Text) return;

        // Create a read-only editor instance
        const editor = createEditor({
            namespace: postId,
            nodes: [HeadingNode, QuoteNode, EmojiNode],
            editable: false,
            onError: (error) => {
                throw error;
            }
        });

        // Register the emoji plugin
        registerEmojiPlugin(editor);

        // Set up the editor
        editor.setRootElement(contentDiv);
        editor.setEditorState(editor.parseEditorState(item.Text));
    },
    render: async ({ item }) => (
        <Flex
            radius="xs"
            direction="column"
            textAlign="left"
            className="post card-glass"
        >
            <Flex direction="column" textAlign="left">
                <Image src={item.UserImgUrl} />
                <Text variant="h4">{item.UserName}</Text>
            </Flex>
            <Flex>{item.Text}</Flex>
            <Flex>
                <Icon icon="thumb_up" />
                <Icon icon="chat" />
            </Flex>
        </Flex>
    )
});
