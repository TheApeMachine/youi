import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Layout } from "@/lib/ui/layout/Layout";

export const render = Component({
    effect: () => {
        console.log("DOMContentLoaded");
        var circleElements = Array.from(document.getElementsByTagName('circle'));
        var circleParentNode: SVGElement | null = null;

        function drawText(word: string) {
            word = word || 'YouI';

            var wordArray = word.split('');
            var innerTextElement = document.getElementById('inner-text');
            if (!innerTextElement) return;
            innerTextElement.innerHTML = '';
            var colorIndex = 0;
            const colors = ['#ff9999',
                '#fcff99',
                '#99ff9c',
                '#99fffd',
                '#999cff',
                '#ff99fc',
                '#fc03a1',
            ];

            circleElements.forEach(function (circle) {
                const parent = circle.parentNode as SVGElement;
                if (!parent) return;
                circleParentNode = parent;
                if (!circleParentNode) return;

                circleParentNode.removeChild(circle);
                circle.style.setProperty('animation-name', '');
            });

            wordArray.forEach(function (letter, index) {
                var span = document.createElement('span');
                span.textContent = letter;
                span.className = 'letter';
                span.style.setProperty('animation-delay', `${400 * index}ms`);
                span.style.setProperty('color', colors[colorIndex]);
                if (!innerTextElement) return;
                innerTextElement.appendChild(span);

                colorIndex++;
                if (colorIndex >= colors.length) {
                    colorIndex = 0;
                }
            });

            circleElements.forEach(function (circle, index) {
                if (!circleParentNode) return;
                circleParentNode.appendChild(circle);
                circle.style.setProperty('animation-name', 'rainbow');

                var delay = (wordArray.length + (circleElements.length - index));
                circle.style.setProperty('animation-delay', `${400 * delay}ms`);
            });
        }

        drawText("YouI");
    },
    render: () => {
        return (
            <Layout>
                <section>
                    <div id="text-spot">
                        <svg id="rainbow" height='100' width='200'>
                            <circle class='colored-circle' cx='100' cy='100' fill='transparent' r='20' stroke-width='10px' stroke='#ff99fc'></circle>
                            <circle class='colored-circle' cx='100' cy='100' fill='transparent' r='40' stroke-width='10px' stroke='#fcff99'></circle>
                            <circle class='colored-circle' cx='100' cy='100' fill='transparent' r='60' stroke-width='10px' stroke='#999cff'></circle>
                            <circle class='colored-circle' cx='100' cy='100' fill='transparent' r='80' stroke-width='10px' stroke='#ff9999'></circle>
                        </svg>
                        <div id="inner-text">

                        </div>
                        <div class="glowButtonWrapper">
                            <button class="glowButton"><span class="buttonText">Click Here</span></button>
                        </div>
                    </div>
                </section>
                <section>
                    <section>
                        <h1>Slide 2</h1>
                    </section>
                    <section>
                        <h1>Slide 3</h1>
                    </section>
                </section>
            </Layout>
        )
    }
});