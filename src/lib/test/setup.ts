import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true
});

global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.Element = dom.window.Element;
global.Node = dom.window.Node;
global.MouseEvent = dom.window.MouseEvent;
global.customElements = dom.window.customElements;

// Setup CSS environment
global.window.CSS = { supports: () => false, escape: (str: string) => str } as unknown as typeof CSS;
global.window.CSSStyleSheet = class {
    replaceSync() { }
    replace() { return Promise.resolve(); }
    cssRules = [] as unknown as CSSRuleList;
} as unknown as typeof CSSStyleSheet;

// Now import vitest and setup mocks
import { beforeAll, afterAll, afterEach, vi } from 'vitest';

// Mock CSS modules first
vi.mock('*.module.css', () => ({}));
vi.mock('@dotlottie/player-component/dist/dotlottie-player.css', () => ({}));

// Mock GSAP
const gsapInstance = {
    to: vi.fn(),
    timeline: vi.fn(() => ({
        to: vi.fn(),
        play: vi.fn(),
        clear: vi.fn()
    })),
    registerPlugin: vi.fn()
};

vi.mock('gsap', () => ({
    __esModule: true,
    gsap: gsapInstance,
    default: gsapInstance,
    registerPlugin: gsapInstance.registerPlugin
}));

vi.mock('gsap/Flip', () => ({
    __esModule: true,
    default: { getState: vi.fn(), from: vi.fn() }
}));

// Mock dotlottie player
vi.mock('@dotlottie/player-component', () => {
    class DotLottiePlayer extends HTMLElement {
        load = vi.fn();
        play = vi.fn();
        pause = vi.fn();
        stop = vi.fn();

        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }
    }

    customElements.define('dotlottie-player', DotLottiePlayer);
    return { default: DotLottiePlayer };
});

// Setup MutationObserver
global.MutationObserver = class {
    constructor(callback: MutationCallback) {
        this.callback = callback;
    }
    callback: MutationCallback;
    target?: Node;
    options?: MutationObserverInit;

    observe(target: Node, options: MutationObserverInit = {}) {
        this.target = target;
        this.options = options;

        // Store callback reference for closure
        const mutationCallback = this.callback;

        // Override removeChild to simulate mutations
        const originalRemoveChild = Element.prototype.removeChild;
        Element.prototype.removeChild = function <T extends Node>(child: T): T {
            const result = originalRemoveChild.call(this, child);
            const record: MutationRecord = {
                type: 'childList',
                target: this,
                addedNodes: [] as any as NodeList,
                removedNodes: [child] as any as NodeList,
                previousSibling: null,
                nextSibling: null,
                attributeName: null,
                attributeNamespace: null,
                oldValue: null
            };
            mutationCallback([record], this as unknown as MutationObserver);
            return result as T;
        };
    }

    disconnect() {
        // Restore original removeChild
        const originalRemoveChild = Element.prototype.removeChild;
        Element.prototype.removeChild = originalRemoveChild;
    }

    takeRecords(): MutationRecord[] {
        return [];
    }
} as unknown as typeof MutationObserver;

beforeAll(() => {
    // Any setup before all tests
});

afterAll(() => {
    // Cleanup after all tests
});

afterEach(() => {
    // Clean the document body after each test
    document.body.innerHTML = '';
}); 