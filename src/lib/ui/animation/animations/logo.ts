import { RAINBOW_COLORS } from "@/lib/ui/logo/Rainbow";

export const logo = () => {
    console.log("Logo animation factory called");

    const animate = () => {
        console.log("Logo animation animate function called");

        const circleElements = Array.from(
            document.getElementsByTagName("circle")
        );
        console.log("Found circle elements:", circleElements);

        const innerTextElement = document.getElementById("inner-text");
        console.log("Found inner text element:", innerTextElement);

        const drawText = (word: string = "Rainbow"): void => {
            console.log("Drawing text:", word);
            const wordArray = word.split("");

            if (innerTextElement) {
                innerTextElement.innerHTML = "";

                let colorIndex = 0;
                wordArray.forEach((letter: string, index: number) => {
                    console.log("Creating letter span:", letter, "with color:", RAINBOW_COLORS[colorIndex]);
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
            console.log("Starting circle animations");
            circleElements.forEach((circle, index) => {
                console.log("Animating circle", index, circle);
                circle.style.setProperty("animation-name", "rainbow");
                const delay = wordArray.length + (circleElements.length - index);
                circle.style.setProperty(
                    "animation-delay",
                    `${400 * delay}ms`
                );
            });
            console.log("Circle animations set up complete");
        };

        // Run initial animation
        console.log("Running initial animation");
        drawText();

        // Set up form listener if form exists
        const form = document.getElementById("custom-text-form");
        console.log("Found custom text form:", form);

        if (form) {
            console.log("Setting up form listener");
            form.addEventListener("submit", function (e: Event) {
                console.log("Form submitted");
                e.preventDefault();
                e.stopPropagation();

                const input = document.getElementById(
                    "custom-text"
                ) as HTMLInputElement;
                if (input) {
                    console.log("Drawing new text from input:", input.value);
                    drawText(input.value);
                }
            });
        }
    };

    return animate;
};
