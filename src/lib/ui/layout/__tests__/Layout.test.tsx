import "../../../test/setup";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Layout } from "../HUD";
import { AuthService } from "@/lib/auth";
import { createRouter } from "@/lib/router";

// Mock dependencies
vi.mock("@/lib/template", () => ({
    jsx: vi.fn(async (type, props, ...children) => {
        if (typeof type === "string") {
            const el = document.createElement(type);
            if (props?.class) el.className = props.class;
            if (props?.id) el.id = props.id;

            for (const child of children.flat()) {
                if (child instanceof Node) {
                    el.appendChild(child);
                } else if (child && typeof child.then === "function") {
                    const resolvedChild = await child;
                    if (resolvedChild) {
                        el.appendChild(resolvedChild);
                    }
                } else if (typeof child === "string") {
                    el.textContent = child;
                }
            }
            return el;
        }

        const result = await type({ ...props, children: children.flat() });
        return result;
    })
}));

vi.mock("@/lib/auth", () => ({
    AuthService: {
        isAuthenticated: vi.fn().mockResolvedValue(true)
    }
}));

vi.mock("@/lib/router", () => ({
    createRouter: vi.fn().mockImplementation(async () => {
        const layout = await Layout({});
        document.body.replaceChildren(layout);
        return { router: vi.fn(), navigateTo: vi.fn() };
    })
}));

vi.mock("reveal.js", () => {
    const mockReveal = {
        initialize: vi.fn().mockResolvedValue({
            on: vi.fn(),
            isReady: () => true,
            sync: vi.fn(),
            slide: vi.fn()
        })
    };
    return { default: mockReveal };
});

describe("Layout Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
        // Setup window.Reveal for router
        (window as any).Reveal = {
            isReady: () => true,
            sync: vi.fn(),
            slide: vi.fn()
        };
    });

    it("renders Flyouts only when user is authenticated", async () => {
        // Test unauthenticated state
        vi.mocked(AuthService.isAuthenticated).mockResolvedValue(false);

        // Initialize router with Layout
        await createRouter();

        // Wait for async children to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(document.querySelector(".reveal")).toBeTruthy();
        expect(document.querySelector(".slides")).toBeTruthy();
        expect(document.querySelector(".dialog")).toBeTruthy();
        expect(document.querySelector(".toaster")).toBeTruthy();
        expect(document.querySelector(".flyout.header")).toBeFalsy();
        expect(document.querySelector(".flyout.aside")).toBeFalsy();
        expect(document.querySelector(".flyout.article")).toBeFalsy();
        expect(document.querySelector(".flyout.footer")).toBeFalsy();

        // Test authenticated state
        document.body.innerHTML = "";
        vi.mocked(AuthService.isAuthenticated).mockResolvedValue(true);

        // Initialize router with Layout again
        await createRouter();

        // Wait for async children to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(document.querySelector(".flyout.header")).toBeTruthy();
        expect(document.querySelector(".flyout.aside")).toBeTruthy();
        expect(document.querySelector(".flyout.article")).toBeTruthy();
        expect(document.querySelector(".flyout.footer")).toBeTruthy();
    });

    it("initializes Reveal.js", async () => {
        const Reveal = require("reveal.js").default;
        await createRouter();

        expect(Reveal.initialize).toHaveBeenCalledWith({
            hash: false,
            respondToHashChanges: false,
            history: false,
            transition: "convex",
            loop: false,
            keyboard: false,
            embedded: true,
            disableLayout: true,
            display: "flex"
        });
    });
});
