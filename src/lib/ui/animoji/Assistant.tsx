import { jsx } from "@/lib/template";
import { Component } from "../Component";
import { Animoji, AnimojiStates } from "./types";
import gsap from "gsap";
import "@dotlottie/player-component";

export const AnimojiAssistant = Component({
    effect: () => {
        const template = document.createElement("template");
        const baseDir = "/src/assets/animoji/";
        const shadow: ShadowRoot = this.attachShadow({ mode: "open" });
        const animojiContainer = shadow.getElementById(
            "animoji-container"
        ) as HTMLDivElement;
        const currentState: keyof typeof AnimojiStates = "idle";
        const currentIndex: number = 0;
        const isTransitioning: boolean = false;
        const lastSwitchTime: number = 0;
        const players: any;
        const currentPlayer: HTMLElement | null = null;
        const cycleInterval: number | null = null;
        const chatContainer: HTMLDivElement = shadow.getElementById(
            "chat-container"
        ) as HTMLDivElement;
        const chatInput: HTMLInputElement = shadow.getElementById(
            "chat-input"
        ) as HTMLInputElement;
        const chatOutput: HTMLDivElement = shadow.getElementById(
            "chat-output"
        ) as HTMLDivElement;
        const boundKeydownHandler: (event: KeyboardEvent) => void;

        shadow.appendChild(template.content.cloneNode(true));
        const animojiContainer = shadow.getElementById(
            "animoji-container"
        ) as HTMLDivElement;
        lastSwitchTime = Date.now();

        players = {};
        // Create the animoji players.
        for (const state in AnimojiStates) {
            players[state as keyof typeof AnimojiStates] = [];
            const stateAnimojis =
                AnimojiStates[state as keyof typeof AnimojiStates];
            if (typeof stateAnimojis === "function") {
                const animojis = new Set();
                for (let i = 0; i < 5; i++) {
                    const animoji = stateAnimojis(i);
                    if (!animojis.has(animoji)) {
                        animojis.add(animoji);
                        const player = createPlayer(animoji);
                        players[state as keyof typeof AnimojiStates].push(
                            player
                        );
                        animojiContainer.appendChild(player);
                    }
                }
            }
        }

        setState("idle");
        startCycling();
        console.log("AnimojiAssistant connected and initialized");

        const createPlayer = (animoji: Animoji) => {
            const player = document.createElement("dotlottie-player") as any;
            player.setAttribute("background", "transparent");
            player.setAttribute("speed", "1");
            player.setAttribute("loop", "true");
            player.setAttribute("autoplay", "true");
            const src = `${baseDir}${animoji}/lottie.json`;
            player.setAttribute("src", src);
            player.style.opacity = "0"; // Set initial opacity to 0
            player.addEventListener("error", (e: any) =>
                console.error("Lottie player error:", e)
            );
            console.log(`Created player with src: ${src}`);
            return player;
        };

        const startCycling = () => {
            if (cycleInterval) {
                clearInterval(cycleInterval);
            }
            cycleInterval = window.setInterval(() => {
                playNextAnimoji();
            }, 5000); // Cycle every 5 seconds
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
                    lastSwitchTime = Date.now();
                    console.log(
                        `Transitioned to ${currentState} animation at index ${currentIndex}`
                    );
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
            console.log(`Setting state to ${newState}`);
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
                    typewriterEffect("Hello! How can I assist you today?");
                    chatInput.focus(); // Focus on the input field
                }
            });
        };

        const disconnectedCallback = () => {
            if (cycleInterval) {
                clearInterval(cycleInterval);
            }

            // Remove the keydown event listener
            document.removeEventListener("keydown", boundKeydownHandler);
        };

        return () => {
            // Cleanup
        };
    },
    render: () => <div id="animoji-container"></div>
});
