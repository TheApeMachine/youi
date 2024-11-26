import { WebsocketProvider } from "y-websocket";
import { Reaction } from "./types";

// Quick reaction options
export const QUICK_REACTIONS = [
    { emoji: "👍", key: "thumbsup" },
    { emoji: "❤️", key: "heart" },
    { emoji: "😄", key: "smile" },
    { emoji: "🎉", key: "tada" },
    { emoji: "🤔", key: "thinking" }
] as const;

export const Reactions = ({ provider, reactions, getCurrentUserId }: {
    provider: WebsocketProvider, reactions: Map<string, Record<string, Reaction>>, getCurrentUserId: () => number
}) => {
    // Helper functions for message interactions
    const addReaction = (messageTimestamp: number, reactionKey: string, sourceElement?: HTMLElement) => {
        if (!provider?.wsconnected) return;

        const messageReactions = reactions.get(messageTimestamp.toString()) || {};
        const reaction = messageReactions[reactionKey] || { emoji: reactionKey, count: 0, users: [] };
        const currentUser = getCurrentUserId();
        const isAdding = !reaction.users.includes(currentUser);

        // Toggle user's reaction
        const userIndex = reaction.users.indexOf(currentUser);
        if (userIndex === -1) {
            reaction.users.push(currentUser);
            reaction.count++;
        } else {
            reaction.users.splice(userIndex, 1);
            reaction.count--;
        }

        // Update the Yjs map
        if (reaction.count > 0) {
            messageReactions[reactionKey] = reaction;
        } else {
            delete messageReactions[reactionKey];
        }
        reactions.set(messageTimestamp.toString(), messageReactions);

        // Immediate visual feedback with animation
        if (sourceElement) {
            const messageElement = sourceElement.closest('.message');
            if (!messageElement) return;

            if (isAdding) {
                // Create flying emoji animation
                const flyingEmoji = document.createElement('div');
                flyingEmoji.className = 'flying-reaction';
                flyingEmoji.textContent = QUICK_REACTIONS.find(r => r.key === reactionKey)?.emoji || reactionKey;

                // Position at click source
                const rect = sourceElement.getBoundingClientRect();
                const messageRect = messageElement.getBoundingClientRect();
                flyingEmoji.style.left = `${rect.left - messageRect.left + rect.width / 2}px`;
                flyingEmoji.style.top = `${rect.top - messageRect.top + rect.height / 2}px`;

                messageElement.appendChild(flyingEmoji);

                // Animate to reactions container
                requestAnimationFrame(() => {
                    flyingEmoji.style.transform = 'translate(-50%, -100px) scale(0.5)';
                    flyingEmoji.style.opacity = '0';

                    setTimeout(() => flyingEmoji.remove(), 500);
                });
            }

            // Update or create reactions container
            updateReactionsContainer(messageElement, messageTimestamp);
        }
    };

    // Helper to update reactions container
    const updateReactionsContainer = (messageElement: Element, messageTimestamp: number) => {
        const messageReactions = reactions.get(messageTimestamp.toString()) || {};
        const currentUser = getCurrentUserId();
        let container = messageElement.querySelector('.message-reactions');

        if (Object.keys(messageReactions).length === 0) {
            container?.remove();
            return;
        }

        if (!container) {
            container = document.createElement('div');
            container.className = 'message-reactions';
            const content = messageElement.querySelector('.message-content');
            content?.appendChild(container);
        }

        // Clear existing reactions
        container.innerHTML = '';

        // Group and render reactions
        Object.entries(messageReactions).forEach(([key, reaction]) => {
            const reactionElement = document.createElement('div');
            reactionElement.className = `reaction ${reaction.users.includes(currentUser) ? 'active' : ''}`;
            reactionElement.onclick = () => addReaction(messageTimestamp, key);

            const emoji = QUICK_REACTIONS.find(r => r.key === key)?.emoji || key;
            reactionElement.innerHTML = `${emoji} <span class="reaction-count">${reaction.count}</span>`;

            container.appendChild(reactionElement);
        });
    };

    return { addReaction, updateReactionsContainer };
};