import { jsx } from "@/lib/vdom";
import { Component } from "@/lib/ui/Component";
import { NeuralCanvas } from "@/lib/ui/neural/NeuralCanvas";
import { eventBus } from "@/lib/event";
import "@/assets/neural.css";

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
        }, 200);
    },
    render: () => {
        return (
            <div>
                <NeuralCanvas />
                <div className="neural-content">
                    <h1>Neural Canvas Demo</h1>
                    <p>Watch as the neural network responds to system events.</p>
                    <button
                        data-trigger="click"
                        data-event="test"
                        data-effect="pulse"
                        data-topic="neural"
                        className="neural-button"
                    >
                        Trigger Event
                    </button>
                </div>
            </div>
        );
    }
}); 