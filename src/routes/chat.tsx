import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createEditor } from "lexical";
import { Profile } from "@/lib/ui/profile/Profile";

export const render = Component({
    effect: () => {
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

        mergeRegister(
            registerRichText(editor),
            registerHistory(editor, createEmptyHistoryState(), 300)
        );

        editor.registerUpdateListener(({ editorState }) => {
            const json = JSON.stringify(editorState.toJSON(), undefined, 2);
        });
    },
    render: async () => (
        <div class="row">
            <div class="column pad shrink">
                <Profile />
            </div>
            <div class="column pad">
                <div class="grow">
                    Chat
                </div>
                <div class="column bg-lighter ring">
                    <div class="editor-wrapper row space-between pad gap bg-lighter">
                        <div id="lexical-editor" class="row pad bg-lighter" contenteditable></div>
                        <span class="material-icons pointer shrink">send</span>
                    </div>
                    <div class="row pad gap bg-lighter">
                        <span class="material-icons pointer">add</span>
                        <span class="material-icons pointer">mic</span>
                        <span class="material-icons pointer">videocam</span>
                    </div>
                </div>
            </div>
        </div>
    )
});
