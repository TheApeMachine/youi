import { RAINBOW_COLORS } from "@/lib/ui/logo/Rainbow";

export const logo = () => {
    const animate = () => {
        const circleElements = Array.from(
            document.getElementsByTagName("circle")
        );

        const innerTextElement = document.getElementById("inner-text");

        const drawText = (word: string = "YOUI"): void => {
            const wordArray = word.split("");

            if (innerTextElement) {
                innerTextElement.innerHTML = "";

                let colorIndex = 0;
                wordArray.forEach((letter: string, index: number) => {
                    const span = document.createElement("span");
                    span.textContent = letter;
                    span.className = "letter";
                    span.style.setProperty(
                        "animation-delay",
                        `${400 * index}ms`
                    );
                    span.style.setProperty(
                        "color",
                        RAINBOW_COLORS[colorIndex]
                    );
                    innerTextElement.appendChild(span);

                    colorIndex++;
                    if (colorIndex >= RAINBOW_COLORS.length) {
                        colorIndex = 0;
                    }
                });
            } else {
                console.warn("No inner text element found for text animation");
            }

            // Animate circles
            circleElements.forEach((circle, index) => {
                circle.style.setProperty("animation-name", "rainbow");
                const delay = wordArray.length + (circleElements.length - index);
                circle.style.setProperty(
                    "animation-delay",
                    `${400 * delay}ms`
                );
            });
        };

        // Run initial animation
        drawText();
    };

    return animate;
};
