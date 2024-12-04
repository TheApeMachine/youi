import { TextNode, $getSelection, $createTextNode, $isRangeSelection, SerializedTextNode } from "lexical";

// Simple emoji mapping
const emojiMap: { [key: string]: string } = {
    ":smile:": "😊",
    ":laugh:": "😄",
    ":wink:": "😉",
    ":heart:": "❤️",
    ":thumbsup:": "👍",
    ":fire:": "🔥",
    ":rocket:": "🚀",
    ":star:": "⭐",
    // Add more emojis as needed
};

interface SerializedEmojiNode extends SerializedTextNode {
    type: 'emoji';
    version: 1;
}

// Create a custom node for emojis
export class EmojiNode extends TextNode {
    static getType(): string {
        return "emoji";
    }

    static clone(node: EmojiNode): EmojiNode {
        return new EmojiNode(node.__text, node.__key);
    }

    // Update importJSON method
    static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
        const node = new EmojiNode(serializedNode.text);
        node.setFormat(serializedNode.format);
        node.setDetail(serializedNode.detail);
        node.setMode(serializedNode.mode);
        node.setStyle(serializedNode.style);
        return node;
    }

    // Update exportJSON method
    exportJSON(): SerializedEmojiNode {
        return {
            ...super.exportJSON(),
            type: 'emoji',
            version: 1,
        };
    }

    createDOM(): HTMLElement {
        const dom = document.createElement("span");
        dom.className = "emoji";
        dom.textContent = this.__text;
        return dom;
    }

    updateDOM(): boolean {
        return false;
    }
}

// Plugin registration function
export function registerEmojiPlugin(editor: any) {
    if (!editor.hasNodes([EmojiNode])) {
        editor.registerNodes([EmojiNode]);
    }

    return editor.registerNodeTransform(TextNode, (node: TextNode) => {
        const textContent = node.getTextContent();
        let newText = textContent;
        let hasChanges = false;
        let offset = 0;

        // Get current selection before transformation
        const selection = $getSelection();
        const isRangeSelection = $isRangeSelection(selection);
        const anchorOffset = isRangeSelection ? selection.anchor.offset : 0;

        // Check if text contains any emoji codes
        for (const [code, emoji] of Object.entries(emojiMap)) {
            const index = textContent.indexOf(code);
            if (index !== -1) {
                hasChanges = true;
                newText = newText.replace(code, emoji);

                // If cursor was after this emoji, adjust the offset
                if (isRangeSelection && index < anchorOffset) {
                    // Subtract the difference in length between code and emoji
                    offset += emoji.length - code.length;
                }
            }
        }

        // Only update if we found and replaced emojis
        if (hasChanges) {
            // Split the node at cursor position to maintain selection
            const newNode = $createTextNode(newText);
            node.replace(newNode);

            // Restore cursor position
            if (isRangeSelection) {
                const newOffset = Math.max(0, anchorOffset + offset);
                selection.anchor.offset = newOffset;
                selection.focus.offset = newOffset;
            }
        }
    });
} 