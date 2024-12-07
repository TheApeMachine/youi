import { DebugModuleSetup } from '../types';

// Add type definition for Performance.memory
declare global {
    interface Performance {
        memory?: {
            usedJSHeapSize: number;
            totalJSHeapSize: number;
            jsHeapSizeLimit: number;
        };
    }
}

export const setup: DebugModuleSetup = {
    name: 'Performance',
    description: 'Monitor application performance metrics',
    setup: async ({ addLog, container }) => {
        const section = document.createElement('div');
        section.className = 'debug-section performance';

        let metrics: {
            fps: number[];
            memory: number[];
            events: number[];
            timestamp: number[];
        } = {
            fps: [],
            memory: [],
            events: [],
            timestamp: []
        };

        // Create chart
        const canvas = document.createElement('canvas');
        section.appendChild(canvas);

        let lastFrameTime = performance.now();
        let frameCount = 0;
        let currentFPS = 0;

        // Calculate FPS
        function calculateFPS() {
            const now = performance.now();
            frameCount++;

            if (now - lastFrameTime >= 1000) {
                currentFPS = frameCount;
                frameCount = 0;
                lastFrameTime = now;
            }

            requestAnimationFrame(calculateFPS);
            return currentFPS;
        }

        // Start FPS calculation
        requestAnimationFrame(calculateFPS);

        // Track event rate
        let eventCount = 0;
        let lastEventCheck = performance.now();
        let currentEventRate = 0;

        const eventHandler = () => {
            eventCount++;
        };

        // Add event listeners for common events
        ['click', 'mousemove', 'keydown', 'scroll'].forEach(eventType => {
            window.addEventListener(eventType, eventHandler);
        });

        function calculateEventRate() {
            const now = performance.now();
            if (now - lastEventCheck >= 1000) {
                currentEventRate = eventCount;
                eventCount = 0;
                lastEventCheck = now;
            }
            return currentEventRate;
        }

        // Update metrics every second
        const interval = setInterval(() => {
            const now = performance.now();

            metrics.fps.push(currentFPS);
            metrics.memory.push(performance.memory?.usedJSHeapSize || 0);
            metrics.events.push(currentEventRate);
            metrics.timestamp.push(now);

            // Keep last 60 seconds
            if (metrics.timestamp.length > 60) {
                metrics.fps.shift();
                metrics.memory.shift();
                metrics.events.shift();
                metrics.timestamp.shift();
            }

            updateChart();
        }, 1000);

        function updateChart() {
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw metrics...
            // (Implementation would go here)
        }

        return {
            component: section,
            cleanup: () => {
                clearInterval(interval);
                ['click', 'mousemove', 'keydown', 'scroll'].forEach(eventType => {
                    window.removeEventListener(eventType, eventHandler);
                });
                metrics = {
                    fps: [],
                    memory: [],
                    events: [],
                    timestamp: []
                };
            }
        };
    }
}; 