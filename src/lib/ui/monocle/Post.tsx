import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEditor } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { EmojiNode, registerEmojiPlugin } from "@/lib/plugins/EmojiPlugin";
import { Flex } from "../Flex";
import { Image } from "../Image";
import { Text } from "../Text";
import { Icon } from "../Icon";
import { sanitizeHTML } from "@/lib/template";
import { Link } from "../Link";

// Add this interface at the top of the file
interface PostItem {
    _id: string;
    Text: string;
    UserImgUrl: string;
    UserName: string;
}

interface PostProps {
    item: PostItem;
    class?: string;
    key?: string;
    data?: any;
}

export const Post = Component({
    effect: (props: PostProps) => {
        // Early validation of required data
        if (!props?.item?._id) {
            console.error('Invalid post props:', props);
            return;
        }

        const postId = `post-${props.item._id}`;
        const contentDiv = document.getElementById(postId) as HTMLElement;
        if (!contentDiv) {
            console.error(`Content div not found for post ${postId}`);
            return;
        }

        if (!props.item.Text) {
            console.warn(`No text content for post ${postId}`);
            contentDiv.textContent = ''; // Clear any existing content
            return;
        }

        // Add debug logging
        console.log('Post content:', {
            id: postId,
            text: props.item.Text,
            type: typeof props.item.Text
        });

        // Check if content contains HTML tags
        const containsHTML = typeof props.item.Text === 'string' && 
            (props.item.Text.includes('<p') || 
             props.item.Text.includes('<div') || 
             props.item.Text.includes('<br'));

        if (containsHTML) {
            // If HTML content, sanitize and insert directly
            const sanitized = sanitizeHTML(props.item.Text);
            console.log('Sanitized HTML:', sanitized);
            contentDiv.innerHTML = sanitized;
            return;
        }

        // Try parsing as JSON first to handle stringified Lexical state
        let lexicalState = props.item.Text;
        if (typeof props.item.Text === 'string') {
            try {
                lexicalState = JSON.parse(props.item.Text);
                console.log('Parsed Lexical state:', lexicalState);
            } catch (e) {
                // If it's not valid JSON, treat as plain text with line breaks
                console.log('Not valid JSON, using as formatted text:', e);
                // Convert newlines to <br> tags and wrap in <p> tags
                const formattedText = props.item.Text
                    .split('\n')
                    .map(line => `<p>${line}</p>`)
                    .join('');
                contentDiv.innerHTML = sanitizeHTML(formattedText);
                return;
            }
        }

        // Otherwise, handle as Lexical content
        const editor = createEditor({
            namespace: postId,
            nodes: [HeadingNode, QuoteNode, EmojiNode],
            editable: false,
            onError: (error) => {
                console.error('Lexical editor error:', error);
                contentDiv.textContent = props.item.Text; // Fallback to plain text
            }
        });

        registerEmojiPlugin(editor);
        editor.setRootElement(contentDiv);

        try {
            editor.setEditorState(editor.parseEditorState(lexicalState));
        } catch (error) {
            console.error('Failed to parse editor state:', error);
            // Format plain text with line breaks
            const formattedText = props.item.Text
                .split('\n')
                .map(line => `<p>${line}</p>`)
                .join('');
            contentDiv.innerHTML = sanitizeHTML(formattedText);
        }
    },
    render: async (props: PostProps) => {
        // Early validation of required data
        if (!props?.item?._id) {
            console.error('Invalid post props:', props);
            return null;
        }

        return (
            <Flex
                radius="xs"
                direction="column"
                textAlign="left"
                background="bg"
                gradient="dark"
                className={props.class || 'post'}
            >
                <Flex direction="column" textAlign="left">
                    <Image src={props.item.UserImgUrl} />
                    <Text variant="h4">{props.item.UserName}</Text>
                </Flex>
                <Flex direction="column" id={`post-${props.item._id}`}>{/* Content will be populated in effect */}</Flex>
                <Flex
                    align="stretch"
                    justifySelf="end"
                    grow={false}
                    fullWidth
                >
                    <Link
                        href="/dashboard/profile"
                        className="accent-button yellow"
                    >
                        <Icon icon="thumb_up" /> 6
                    </Link>
                    <Link
                        href="/dashboard/profile"
                        className="accent-button green"
                    >
                        <Icon icon="chat" />
                        14
                    </Link>
                </Flex>
            </Flex>
        );
    }
});
