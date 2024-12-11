import { jsx } from "@/lib/template";
import Toaster from "@/lib/ui/toast/Toaster";
import { Header } from "@/lib/ui/layout/Header";
import gsap from "gsap";

export default () => {
    const onMount = () => {
        const SHOW_THRESHOLD = 50;
        let isVisible = false;
        const hudElement = document.querySelector('.hud') as HTMLElement;
        const headerElement = hudElement?.querySelector('header') as HTMLElement;

        if (hudElement) {
            // Initial state
            gsap.set(hudElement, {
                top: "-100px",
                left: "-100px",
                right: "-100px",
                bottom: "-100px",
                opacity: 0,
                backdropFilter: "blur(0)",
                pointerEvents: "none"
            });

            gsap.set(headerElement, {
                height: 0,
                overflow: "hidden"
            });

            const handleMouseMove = (e: MouseEvent) => {
                const mouseY = e.clientY;
                const headerRect = headerElement?.getBoundingClientRect();
                const isOverHeader = headerRect && mouseY >= headerRect.top && mouseY <= headerRect.bottom;
                const shouldShow = mouseY <= SHOW_THRESHOLD || isOverHeader;

                if (shouldShow !== isVisible) {
                    isVisible = shouldShow;
                    
                    const tl = gsap.timeline({
                        defaults: {
                            duration: 0.5,
                            ease: "power2.inOut"
                        }
                    });

                    if (isVisible) {
                        tl.to(hudElement, {
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            opacity: 1,
                            backdropFilter: "blur(var(--space-xxs))",
                            pointerEvents: "auto"
                        })
                        .to(headerElement, {
                            height: "auto",
                            overflow: "visible"
                        }, "<");
                    } else {
                        tl.to(hudElement, {
                            top: "-100px",
                            left: "-100px",
                            right: "-100px",
                            bottom: "-100px",
                            opacity: 0,
                            backdropFilter: "blur(0)",
                            pointerEvents: "none"
                        })
                        .to(headerElement, {
                            height: 0,
                            overflow: "hidden"
                        }, "<");
                    }
                }
            };

            window.addEventListener('mousemove', handleMouseMove);

            // Cleanup
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
            };
        }
    };

    return (
        <div class="hud" onMount={onMount}>
            <Header />
            <Toaster />
        </div>
    )
};
