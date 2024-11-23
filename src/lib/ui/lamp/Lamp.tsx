import { jsx } from "@/lib/template"
import { Component } from "@/lib/ui/Component"
import gsap from "gsap"
import Draggable from "gsap/Draggable"

// Add type declaration for View Transitions API
declare global {
    interface Document {
        startViewTransition?: (callback: () => void) => void
    }
}

gsap.registerPlugin(Draggable)

export const Lamp = Component({
    effect: async () => {
        document.documentElement.dataset.theme = 'dark'

        // Used to calculate distance of "tug"
        let startX: number
        let startY: number

        const AUDIO = {
            CLICK: new Audio('https://assets.codepen.io/605876/click.mp3'),
        }

        const heading = document.querySelector('h1')

        const CORD_DURATION = 0.1

        const CORDS = document.querySelectorAll('.toggle-scene__cord')
        const HIT = document.querySelector('.grab-handle')
        const DUMMY = document.querySelector('.toggle-scene__dummy-cord')
        const DUMMY_CORD = document.querySelector('.toggle-scene__dummy-cord line')
        const FORM = document.querySelector('form')
        const TOGGLE = FORM?.querySelector('button')
        const PROXY = document.createElement('div')
        // set init position
        const ENDX = Number(DUMMY_CORD?.getAttribute('x2')) || 0
        const ENDY = Number(DUMMY_CORD?.getAttribute('y2')) || 0
        const RESET = () => {
            gsap.set(PROXY, {
                x: ENDX,
                y: ENDY,
            })
        }

        RESET()

        const toggle = () => {
            AUDIO.CLICK.play()
            const theme = TOGGLE?.matches('[aria-pressed=false]')
            TOGGLE?.setAttribute('aria-pressed', theme ? 'true' : 'false')
            document.documentElement.dataset.theme = theme ? 'light' : 'dark'
            if (!heading) return
            heading.innerText = `lights ${theme ? 'on' : 'off'}.`
        }

        FORM?.addEventListener('submit', (event) => {
            event.preventDefault()

            if (!document.startViewTransition) return toggle()
            document.startViewTransition(() => toggle())
        })

        const CORD_TL = gsap.timeline({
            paused: true,
            onStart: () => {
                FORM?.requestSubmit()
                gsap.set([DUMMY, HIT], { display: 'none' })
                gsap.set(CORDS[0], { display: 'block' })
            },
            onComplete: () => {
                gsap.set([DUMMY, HIT], { display: 'block' })
                gsap.set(CORDS[0], { display: 'none' })
                RESET()
            },
        })

        for (let i = 1; i < CORDS.length; i++) {
            CORD_TL.add(
                gsap.to(CORDS[0], {
                    morphSVG: CORDS[i] as SVGPathElement,
                    duration: CORD_DURATION,
                    repeat: 1,
                    yoyo: true,
                })
            )
        }

        Draggable.create(PROXY, {
            trigger: HIT,
            type: 'x,y',
            onPress: (e) => {
                startX = e.x
                startY = e.y
            },
            onDragStart: () => {
                document.documentElement.style.setProperty('cursor', 'grabbing')
            },
            onDrag: function () {
                // Need to map the coordinates based on scaling.
                // ViewBox to physical sizing
                // The ViewBox width is 134
                const ratio = 1 / ((FORM?.offsetWidth || 0) * 0.65 / 134)
                gsap.set(DUMMY_CORD, {
                    attr: {
                        x2: this.startX + (this.x - this.startX) * ratio,
                        y2: this.startY + (this.y - this.startY) * ratio,
                    },
                })
            },
            onRelease: (e) => {
                const DISTX = Math.abs(e.x - startX)
                const DISTY = Math.abs(e.y - startY)
                const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY)
                document.documentElement.style.setProperty('cursor', 'unset')
                gsap.to(DUMMY_CORD, {
                    attr: { 
                        x2: Number(ENDX) || 0, 
                        y2: Number(ENDY) || 0 
                    },
                    duration: CORD_DURATION,
                    onComplete: () => {
                        if (TRAVELLED > 50) {
                            CORD_TL.restart()
                        } else {
                            RESET()
                        }
                    },
                })
            },
        })

    },
    render: () => {
        return (
            <form>
                <div class="arrow">
                    <label>drag me.</label>
                    <svg
                        aria-hidden="true"
                        viewBox="0 0 144 141"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M129.189 0.0490494C128.744 0.119441 126.422 0.377545 124.03 0.635648C114.719 1.6446 109.23 2.4893 108.058 3.09936C107.119 3.56864 106.674 4.34295 106.674 5.44576C106.674 6.71281 107.424 7.51058 109.043 7.97986C110.403 8.37875 110.825 8.42567 118.87 9.52847C121.778 9.92736 124.288 10.3028 124.475 10.3732C124.663 10.4436 122.951 11.1006 120.676 11.8749C110.028 15.4414 100.412 20.7677 91.7339 27.9242C88.38 30.7164 81.6957 37.4271 79.2096 40.5009C73.8387 47.2116 69.6874 54.8139 66.5681 63.7302C65.9348 65.4665 65.3484 66.8978 65.2546 66.8978C65.1374 66.8978 63.7771 66.7336 62.2291 66.5693C52.9649 65.5134 43.1847 68.1649 34.1316 74.2186C24.7735 80.46 18.5349 87.7338 10.5371 101.742C2.53943 115.726 -1.0959 127.482 0.287874 135.014C0.89767 138.463 2.0469 140.035 3.97011 140.082C5.28352 140.105 5.37733 139.659 4.20465 139.049C3.05541 138.463 2.6567 137.9 2.32835 136.281C0.616228 128.021 6.24512 113.028 17.4325 96.1104C23.2725 87.241 28.362 81.9147 35.5622 77.1046C43.8649 71.5437 52.7069 69.033 61.1737 69.8308C64.9967 70.1828 64.6917 69.9247 64.1992 72.4822C62.2525 82.5013 63.8005 92.6378 67.9753 97.354C73.1116 103.079 81.9771 102 85.0027 95.2657C86.3395 92.2858 86.3864 87.7103 85.1434 83.9796C83.1498 78.0901 80.007 73.8197 75.4335 70.8163C73.8152 69.7604 70.4848 68.1883 69.875 68.1883C69.359 68.1883 69.4294 67.6487 70.2268 65.3257C72.3377 59.2486 75.457 52.7021 78.4122 48.244C83.2436 40.9232 91.4524 32.5701 99.1687 27.103C105.806 22.4102 113.241 18.5386 120.512 16.0045C123.772 14.8548 129.87 13.1889 130.081 13.3766C130.128 13.447 129.541 14.362 128.791 15.4414C124.78 21.0258 122.716 26.0706 122.388 30.998C122.224 33.7198 122.341 34.588 122.88 34.2595C122.998 34.1891 123.678 32.969 124.405 31.5611C126.281 27.8069 131.722 20.6738 139.579 11.6402C141.127 9.85697 142.652 7.86254 143.027 7.08823C144.552 4.03792 143.52 1.48035 140.377 0.471397C139.439 0.166366 138.102 0.0490408 134.584 0.0255769C132.074 -0.021351 129.635 0.00212153 129.189 0.0490494ZM137.117 4.92955C137.187 5.0234 136.718 5.63346 136.061 6.29045L134.865 7.48712L131.042 6.73627C128.931 6.33739 126.727 5.9385 126.14 5.8681C124.827 5.68039 124.123 5.32843 124.968 5.28151C125.296 5.28151 126.868 5.11725 128.486 4.953C131.3 4.64797 136.812 4.62451 137.117 4.92955ZM71.5168 72.5292C76.2075 74.899 79.4441 78.8175 81.3204 84.355C83.6189 91.1361 81.2266 96.8378 76.0433 96.8847C73.3227 96.9082 70.9773 95.2188 69.5936 92.2389C68.2802 89.4232 67.6938 86.5606 67.5765 82.1259C67.4593 78.3248 67.6 76.4242 68.2333 72.7403L68.4912 71.2856L69.359 71.5906C69.8515 71.7548 70.8132 72.1772 71.5168 72.5292Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>
                <button aria-pressed="false">
                    <span class="sr-only">Toggle theme</span>
                    <svg
                        aria-hidden="true"
                        class="toggle-scene"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="32 32 134 134"
                    >
                        <defs>
                            <marker id="e" orient="auto" overflow="visible" refx="0" refy="0">
                                <path
                                    class="toggle-scene__cord-end"
                                    fill-rule="evenodd"
                                    stroke-width=".2666"
                                    d="M.98 0a1 1 0 11-2 0 1 1 0 012 0z"
                                ></path>
                            </marker>
                            <marker id="d" orient="auto" overflow="visible" refx="0" refy="0">
                                <path
                                    class="toggle-scene__cord-end"
                                    fill-rule="evenodd"
                                    stroke-width=".2666"
                                    d="M.98 0a1 1 0 11-2 0 1 1 0 012 0z"
                                ></path>
                            </marker>
                            <marker id="c" orient="auto" overflow="visible" refx="0" refy="0">
                                <path
                                    class="toggle-scene__cord-end"
                                    fill-rule="evenodd"
                                    stroke-width=".2666"
                                    d="M.98 0a1 1 0 11-2 0 1 1 0 012 0z"
                                ></path>
                            </marker>
                            <marker id="b" orient="auto" overflow="visible" refx="0" refy="0">
                                <path
                                    class="toggle-scene__cord-end"
                                    fill-rule="evenodd"
                                    stroke-width=".2666"
                                    d="M.98 0a1 1 0 11-2 0 1 1 0 012 0z"
                                ></path>
                            </marker>
                            <marker id="a" orient="auto" overflow="visible" refx="0" refy="0">
                                <path
                                    class="toggle-scene__cord-end"
                                    fill-rule="evenodd"
                                    stroke-width=".2666"
                                    d="M.98 0a1 1 0 11-2 0 1 1 0 012 0z"
                                ></path>
                            </marker>
                            <clippath id="g" clippathunits="userSpaceOnUse">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="4.677"
                                    d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"
                                ></path>
                            </clippath>
                            <clippath id="f" clippathunits="userSpaceOnUse">
                                <path
                                    d="M-868.418 945.051c-4.188 73.011 78.255 53.244 150.216 52.941 82.387-.346 98.921-19.444 98.921-47.058 0-27.615-4.788-42.55-73.823-42.55-69.036 0-171.436-30.937-175.314 36.667z"
                                ></path>
                            </clippath>
                        </defs>
                        <g class="toggle-scene__cords">
                            <path
                                class="toggle-scene__cord"
                                marker-end="url(#a)"
                                fill="none"
                                stroke-linecap="square"
                                stroke-width="6"
                                d="M123.228-28.56v150.493"
                                transform="translate(-24.503 256.106)"
                            ></path>
                            <path
                                class="toggle-scene__cord"
                                marker-end="url(#a)"
                                fill="none"
                                stroke-linecap="square"
                                stroke-width="6"
                                d="M123.228-28.59s28 8.131 28 19.506-18.667 13.005-28 19.507c-9.333 6.502-28 8.131-28 19.506s28 19.507 28 19.507"
                                transform="translate(-24.503 256.106)"
                            ></path>
                            <path
                                class="toggle-scene__cord"
                                marker-end="url(#a)"
                                fill="none"
                                stroke-linecap="square"
                                stroke-width="6"
                                d="M123.228-28.575s-20 16.871-20 28.468c0 11.597 13.333 18.978 20 28.468 6.667 9.489 20 16.87 20 28.467 0 11.597-20 28.468-20 28.468"
                                transform="translate(-24.503 256.106)"
                            ></path>
                            <path
                                class="toggle-scene__cord"
                                marker-end="url(#a)"
                                fill="none"
                                stroke-linecap="square"
                                stroke-width="6"
                                d="M123.228-28.569s16 20.623 16 32.782c0 12.16-10.667 21.855-16 32.782-5.333 10.928-16 20.623-16 32.782 0 12.16 16 32.782 16 32.782"
                                transform="translate(-24.503 256.106)"
                            ></path>
                            <path
                                class="toggle-scene__cord"
                                marker-end="url(#a)"
                                fill="none"
                                stroke-linecap="square"
                                stroke-width="6"
                                d="M123.228-28.563s-10 24.647-10 37.623c0 12.977 6.667 25.082 10 37.623 3.333 12.541 10 24.647 10 37.623 0 12.977-10 37.623-10 37.623"
                                transform="translate(-24.503 256.106)"
                            ></path>
                            <g class="line toggle-scene__dummy-cord">
                                <line
                                    marker-end="url(#a)"
                                    x1="98"
                                    x2="98"
                                    y1="240"
                                    y2="380"
                                ></line>
                            </g>
                            <circle
                                class="toggle-scene__hit-spot"
                                cx="98.7255"
                                cy="380.5405"
                                r="60"
                                fill="transparent"
                            ></circle>
                        </g>
                        <g
                            class="toggle-scene__bulb bulb"
                            transform="translate(844.069 -645.213)"
                        >
                            <path
                                class="bulb__cap"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="4.677"
                                d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"
                            ></path>
                            <path
                                class="bulb__cap-shine"
                                d="M-778.379 802.873h25.512v118.409h-25.512z"
                                clip-path="url(#g)"
                                transform="matrix(.52452 0 0 .90177 -368.282 82.976)"
                            ></path>
                            <path
                                class="bulb__cap"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="4"
                                d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v0s-8.439 10.115-28.817 10.115c-21.673 0-29.59-10.115-29.59-10.115z"
                            ></path>
                            <path
                                class="bulb__cap-outline"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="4.677"
                                d="M-774.546 827.629s12.917-13.473 29.203-13.412c16.53.062 29.203 13.412 29.203 13.412v53.6s-8.825 16-29.203 16c-21.674 0-29.203-16-29.203-16z"
                            ></path>
                            <g
                                class="bulb__filament"
                                fill="none"
                                stroke-linecap="round"
                                stroke-width="5"
                            >
                                <path d="M-752.914 823.875l-8.858-33.06"></path>
                                <path d="M-737.772 823.875l8.858-33.06"></path>
                            </g>
                            <path
                                class="bulb__bulb"
                                stroke-linecap="round"
                                stroke-width="5"
                                d="M-783.192 803.855c5.251 8.815 5.295 21.32 13.272 27.774 12.299 8.045 36.46 8.115 49.127 0 7.976-6.454 8.022-18.96 13.273-27.774 3.992-6.7 14.408-19.811 14.408-19.811 8.276-11.539 12.769-24.594 12.769-38.699 0-35.898-29.102-65-65-65-35.899 0-65 29.102-65 65 0 13.667 4.217 26.348 12.405 38.2 0 0 10.754 13.61 14.746 20.31z"
                            ></path>
                            <circle
                                class="bulb__flash"
                                cx="-745.343"
                                cy="743.939"
                                r="83.725"
                                fill="none"
                                stroke-dasharray="10,30"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="10"
                            ></circle>
                            <path
                                class="bulb__shine"
                                fill="none"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="12"
                                d="M-789.19 757.501a45.897 45.897 0 013.915-36.189 45.897 45.897 0 0129.031-21.957"
                            ></path>
                        </g>
                    </svg>
                    <div class="grab-handle"></div>
                </button>
            </form>
        )
    }
})