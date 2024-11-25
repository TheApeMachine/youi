import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { faker } from "@faker-js/faker";
import { createEditor } from "lexical";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { EmojiNode, registerEmojiPlugin } from "@/lib/plugins/EmojiPlugin";

export const Post = Component({
    effect: ({ content, timestamp }) => {
        // Create a unique ID for this post's content
        const postId = `post-${timestamp}`;
        const contentDiv = document.getElementById(postId) as HTMLElement;
        if (!contentDiv || !content) return;

        // Create a read-only editor instance
        const editor = createEditor({
            namespace: `post-${timestamp}`,
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
        editor.setEditorState(editor.parseEditorState(content));
    },
    render: async ({ sender, timestamp }) => (
        <div class="post column bg-lighter radius-sm ring-light">
            <div class="row space-between pad-sm gap shrink border-bottom">
                <img
                    class="ring-dark"
                    alt="avatar"
                    src={faker.image.avatarGitHub()}
                />
                <div class="status online"></div>
                <h4>{sender ?? faker.person.fullName()}</h4>
            </div>
            <div
                id={`post-${timestamp}`}
                class="post-content pad-sm grow"
            ></div>
            <div class="row space-between pad-sm gap shrink border-top left">
                <span class="material-icons dark pointer width text-center">
                    thumb_up
                </span>
                <span class="material-icons dark pointer width text-center">
                    chat
                </span>
            </div>
        </div>
    )
});
