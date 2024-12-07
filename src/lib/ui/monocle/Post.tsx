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
    user?: {
        FirstName: string;
        LastName: string;
    };
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
            console.error("Invalid post props:", props);
            return;
        }

        const postId = props.key;
        const contentDiv = document.getElementById(postId) as HTMLElement;
        if (!contentDiv) {
            console.error(`Content div not found for post ${postId}`);
            return;
        }

        if (!props.item.Text) {
            console.warn(`No text content for post ${postId}`);
            contentDiv.textContent = ""; // Clear any existing content
            return;
        }

        // Quick check if content looks like Lexical JSON state
        const looksLikeLexicalState =
            typeof props.item.Text === "string" &&
            props.item.Text.trim().startsWith('{"root":');

        if (looksLikeLexicalState) {
            try {
                const lexicalState = JSON.parse(props.item.Text);
                console.log("Parsed Lexical state:", lexicalState);

                // Initialize Lexical editor
                const editor = createEditor({
                    namespace: postId,
                    nodes: [HeadingNode, QuoteNode, EmojiNode],
                    editable: false,
                    onError: (error) => {
                        console.error("Lexical editor error:", error);
                        contentDiv.textContent = props.item.Text;
                    }
                });

                registerEmojiPlugin(editor);
                editor.setRootElement(contentDiv);
                editor.setEditorState(editor.parseEditorState(lexicalState));
                return;
            } catch (e) {
                console.warn("Failed to parse potential Lexical state:", e);
            }
        }

        // Handle as regular text content
        const formattedText = props.item.Text.split("\n")
            .map((line) => `<p>${line}</p>`)
            .join("");
        contentDiv.innerHTML = sanitizeHTML(formattedText);
    },
    render: async (props: PostProps) => {
        // Early validation of required data
        if (!props?.item?._id) {
            console.error("Invalid post props:", props);
            return null;
        }

        return (
            <Flex
                radius="xs"
                direction="column"
                textAlign="left"
                background="bg"
                gradient="dark"
                className={props.class ?? "post"}
                fullWidth
            >
                <Flex direction="column" textAlign="left">
                    <Image src={props.item.UserImgUrl + "&width=64"} />
                    <Text variant="h4">
                        {props.item.UserName ??
                            `${props.item.user?.FirstName} ${props.item.user?.LastName}`}
                    </Text>
                </Flex>
                <Flex
                    direction="column"
                    align="start"
                    justify="start"
                    id={props.key}
                >
                    {/* Content will be populated in effect */}
                </Flex>
                <Flex align="stretch" justifySelf="end" grow={false} fullWidth>
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
