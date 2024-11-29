import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { NeuralCanvas } from "@/lib/ui/neural/NeuralCanvas";
import { eventBus } from "@/lib/event";

export const render = Component({
    effect: () => {
        // Simulate some system events
        setInterval(() => {
            eventBus.publish("test", {
                event: "test",
                topic: "neural",
                effect: "pulse",
                trigger: "timer",
                originalEvent: null
            });
        }, 2000);
    },
    render: () => {
        return (
            <div>
                <NeuralCanvas />
                <div style={{
                    position: "relative",
                    zIndex: 1,
                    padding: "2rem",
                    color: "white",
                    textShadow: "0 0 10px rgba(0,0,0,0.5)"
                }}>
                    <h1>Neural Canvas Demo</h1>
                    <p>Watch as the neural network responds to system events.</p>
                    <button
                        data-trigger="click"
                        data-event="test"
                        data-effect="pulse"
                        data-topic="neural"
                        style={{
                            background: "rgba(0,255,136,0.2)",
                            border: "1px solid #0f8",
                            color: "#0f8",
                            padding: "0.5rem 1rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginTop: "1rem"
                        }}
                    >
                        Trigger Event
                    </button>
                </div>
            </div>
        );
    }
}); 