import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import "@/assets/logo.css";
import { Expanse } from "@/lib/ui/logo/Expanse";

export const render = Component({
    effect: () => {
        const circleElements = Array.from(
            document.getElementsByTagName("circle")
        );
        let circleParentNode: Element | null = null;

        const drawText = (word: string = "YouI") => {
            const wordArray = word.split("");
            const innerTextElement = document.getElementById("inner-text");
            if (!innerTextElement) return;
            innerTextElement.innerHTML = "";

            let colorIndex = 0;
            const colors = [
                "#D8334A",
                "#AC92EC",
                "#F6BB42",
                "#2ECC71",
                "#EC87C0",
                "#E9573F",
                "#4FC1E9"
            ];

            circleElements.forEach((circle, index) => {
                const parent = circle.parentNode as Element;
                circleParentNode = circleParentNode || parent;
                if (!circleParentNode) return;
                circleParentNode.removeChild(circle);
                circle.style.animationName = "";
            });

            wordArray.forEach((letter, index) => {
                const span = document.createElement("span");
                span.textContent = letter;
                span.className = "letter";
                span.style.animationDelay = `${400 * index}ms`;
                span.style.color = colors[colorIndex];
                innerTextElement.appendChild(span);

                colorIndex++;
                if (colorIndex >= colors.length) {
                    colorIndex = 0;
                }
            });

            circleElements.forEach((circle, index) => {
                if (!circleParentNode) return;
                circleParentNode.appendChild(circle);
                circle.style.animationName = "rainbow";

                const delay =
                    wordArray.length + (circleElements.length - index);
                circle.style.animationDelay = `${400 * delay}ms`;
            });
        };

        const form = document.getElementById("custom-text-form");
        const textInput = document.getElementById(
            "custom-text"
        ) as HTMLInputElement;

        if (form && textInput) {
            form.addEventListener("submit", function (e) {
                e.preventDefault();
                e.stopPropagation();
                drawText(textInput.value);
            });
        }

        drawText();
    },
    render: async () => <Expanse />
});
