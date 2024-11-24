import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { createEmptyHistoryState, registerHistory } from "@lexical/history";
import { HeadingNode, QuoteNode, registerRichText } from "@lexical/rich-text";
import { mergeRegister } from "@lexical/utils";
import { createEditor } from "lexical";

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
        <div class="column">
            <div class="editor-wrapper row">
                <div id="lexical-editor" contenteditable></div>
                <span class="material-icons">send</span>
            </div>
        </div>
    )
});
