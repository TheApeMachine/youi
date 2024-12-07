import { jsx } from "@/lib/template";
import { Component } from "../Component";
import { AnimojiStates } from "./types";
import { TypeWriter } from "./Typewriter";
import gsap from "gsap";
import "@dotlottie/player-component";

export const AnimojiAssistant = Component({
    effect: (element: HTMLElement) => {
        let currentState: keyof typeof AnimojiStates = "idle";
        let currentIndex: number = 0;
        let isTransitioning: boolean = false;
        let players: Record<keyof typeof AnimojiStates, any[]> = {
            idle: [],
            chat: []
        };
        let currentPlayer: HTMLElement | null = null;
        let cycleInterval: number | null = null;

        // Get direct references to DOM elements
        const animojiContainer = element.querySelector(
            "#animoji-container"
        ) as HTMLDivElement;
        const chatContainer = element.querySelector(
            "#chat-container"
        ) as HTMLDivElement;
        const chatInput = element.querySelector(
            "#chat-input"
        ) as HTMLInputElement;

        // Define all functions first
        const createPlayer = () => {
            const player = document.createElement("dotlottie-player") as any;
            player.style.opacity = "0";
            player.style.position = "absolute";
            player.style.top = "0";
            player.style.left = "0";
            player.style.width = "100%";
            player.style.height = "100%";
            return player;
        };

        const startCycling = () => {
            if (cycleInterval) {
                clearInterval(cycleInterval);
            }
            cycleInterval = window.setInterval(() => {
                playNextAnimoji();
            }, 5000);
        };

        const playNextAnimoji = () => {
            const currentPlayers = players[currentState];
            if (!currentPlayers || currentPlayers.length === 0) {
                console.error(`No players found for state ${currentState}`);
                return;
            }

            isTransitioning = true;
            currentIndex = (currentIndex + 1) % currentPlayers.length;
            const nextPlayer = currentPlayers[currentIndex];

            const tl = gsap.timeline({
                onComplete: () => {
                    currentPlayer = nextPlayer;
                    isTransitioning = false;
                }
            });

            if (currentPlayer) {
                tl.to(currentPlayer, {
                    opacity: 0,
                    duration: 0.25,
                    ease: "power2.inOut"
                });
            }
            tl.to(
                nextPlayer,
                { opacity: 1, duration: 0.25, ease: "power2.inOut" },
                "<"
            );
            tl.play();
        };

        const setState = (newState: keyof typeof AnimojiStates | "chat") => {
            if (currentState !== newState && !isTransitioning) {
                if (newState === "chat") {
                    enterChatMode();
                } else {
                    if (currentState === "chat") {
                        exitChatMode();
                    }
                    currentState = newState as keyof typeof AnimojiStates;
                    currentIndex = -1;
                    playNextAnimoji();
                }
            }
        };

        const enterChatMode = () => {
            currentState = "chat";
            gsap.to(animojiContainer, {
                width: "300px",
                height: "400px",
                duration: 0.5,
                ease: "power2.inOut",
                onComplete: () => {
                    chatContainer.style.display = "block";
                    chatInput.focus(); // Focus on the input field
                }
            });
        };

        const exitChatMode = () => {
            // Add implementation
            chatContainer.style.display = "none";
        };

        // Create the animoji players
        for (const state in AnimojiStates) {
            const stateAnimojis =
                AnimojiStates[state as keyof typeof AnimojiStates];
            if (Array.isArray(stateAnimojis)) {
                const animojis = new Set<string>();
                stateAnimojis.forEach((animoji) => {
                    if (!animojis.has(animoji)) {
                        animojis.add(animoji);
                        const player = createPlayer();
                        players[state as keyof typeof AnimojiStates].push(
                            player
                        );
                        animojiContainer.appendChild(player);
                    }
                });
            }
        }

        setState("idle");
        startCycling();

        return () => {
            if (cycleInterval) {
                clearInterval(cycleInterval);
            }
        };
    },
    render: () => (
        <div>
            <div id="animoji-container"></div>
            <div id="chat-container" style={{ display: "none" }}>
                <div id="chat-output">
                    <TypeWriter />
                </div>
                <input id="chat-input" type="text" />
            </div>
        </div>
    )
});
