import "../../../test/setup";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Header } from "../Header";
import { stateManager } from "@/lib/state";
import { AuthService } from "@/lib/auth";
import { Flyout } from "../../Flyout";
import { eventBus } from "@/lib/event";

// Define component types
type HeaderComponent = {
    (props: any): Promise<HTMLElement>;
    effect?: (props: { rootElement: HTMLElement }) => void;
};

// Mock dependencies
vi.mock("@/lib/template", () => ({
    jsx: vi.fn((type, props, ...children) => {
        console.log("JSX Mock called with:", {
            type: typeof type === "function" ? type.name : type,
            props
        });

        if (typeof type === "string") {
            const el = document.createElement(type);
            if (props?.class) {
                el.className = props.class;
            }
            if (props?.className) {
                el.className = props.className;
            }
            children.flat().forEach((child) => {
                if (child instanceof Node) {
                    el.appendChild(child);
                } else if (child && typeof child.then === "function") {
                    // Handle Promise (async children)
                    child.then((resolvedChild: Node | null | undefined) => {
                        if (resolvedChild) {
                            el.appendChild(resolvedChild);
                        }
                    });
                } else if (typeof child === "string") {
                    el.textContent = child;
                }
            });
            return el;
        }
        // Handle component functions
        if (typeof type === "function") {
            const result = type({ ...props, children: children.flat() });
            console.log("Component result:", result);
            return result;
        }
        return type({ ...props, children: children.flat() });
    })
}));

vi.mock("../Flex", () => ({
    Flex: vi.fn(({ children, className }) => {
        console.log("Flex Mock called with:", { className, children });
        const div = document.createElement("div");
        div.className = `flex ${className || ""}`;
        if (Array.isArray(children)) {
            children.forEach((child) => {
                if (child instanceof Node) {
                    div.appendChild(child);
                }
            });
        } else if (children instanceof Node) {
            div.appendChild(children);
        }
        return div;
    })
}));

vi.mock("../button/Button", () => ({
    Button: vi.fn(({ variant, icon, className }) => {
        console.log("Button Mock called with:", { variant, icon, className });
        const button = document.createElement("button");
        button.className = `${variant} ${className || ""} ${icon || ""}`;
        return button;
    })
}));

vi.mock("../profile/Avatar", () => ({
    Avatar: vi.fn(() => {
        const authUser = vi.mocked(stateManager.getState)("authUser");
        console.log("Avatar Mock called with authUser:", authUser);

        if (authUser?.picture) {
            const img = document.createElement("img");
            img.src = authUser.picture;
            img.alt = "avatar";
            img.className = "avatar";
            img.setAttribute("data-trigger", "click");
            img.setAttribute("data-event", "menu");
            img.setAttribute("data-effect", "submenu");
            return Promise.resolve(img);
        } else {
            const span = document.createElement("span");
            span.className = "material-symbols-rounded";
            span.textContent = "person";
            return Promise.resolve(span);
        }
    })
}));

vi.mock("../Icon", () => ({
    Icon: vi.fn(({ icon }) => {
        const i = document.createElement("i");
        i.className = "material-icons";
        i.textContent = icon;
        return i;
    })
}));

vi.mock("@/lib/state", () => ({
    stateManager: {
        getState: vi.fn((key: string) => {
            if (key === "authUser") {
                return { picture: "https://example.com/avatar.jpg" };
            }
            return null;
        })
    }
}));

vi.mock("@/lib/auth", () => ({
    AuthService: {
        isAuthenticated: vi.fn()
    }
}));

vi.mock("@/lib/event", () => ({
    eventBus: {
        subscribe: vi.fn()
    }
}));

describe("Header Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });

    it("renders header with avatar when authenticated with picture", async () => {
        vi.mocked(AuthService.isAuthenticated).mockResolvedValue(true);
        vi.mocked(stateManager.getState).mockImplementation((key: string) => {
            if (key === "authUser") {
                return { picture: "https://example.com/avatar.jpg" };
            }
            return null;
        });

        const layout = document.createElement("div");
        layout.className = "layout";
        document.body.appendChild(layout);

        const flyout = await Flyout({ variant: "header", direction: "top" });
        layout.appendChild(flyout);

        // Wait for all promises to resolve
        await new Promise(process.nextTick);

        const avatar = document.querySelector(
            'img.avatar[src="https://example.com/avatar.jpg"]'
        );
        expect(avatar).toBeTruthy();
    });

    it("renders header with person icon when authenticated without picture", async () => {
        vi.mocked(AuthService.isAuthenticated).mockResolvedValue(true);
        vi.mocked(stateManager.getState).mockImplementation((key: string) => {
            if (key === "authUser") {
                return { picture: null };
            }
            return null;
        });

        // Create layout structure
        const layout = document.createElement("div");
        layout.className = "layout";
        document.body.appendChild(layout);

        const flyout = await Flyout({ variant: "header", direction: "top" });
        layout.appendChild(flyout);

        // Wait for async children to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(
            document.querySelector("span.material-symbols-rounded")
        ).toBeTruthy();
        expect(document.querySelector("img.avatar")).toBeFalsy();
    });

    it("handles menu events when avatar is clicked", async () => {
        vi.mocked(AuthService.isAuthenticated).mockResolvedValue(true);
        vi.mocked(stateManager.getState).mockImplementation((key: string) => {
            if (key === "authUser") {
                return { picture: "https://example.com/avatar.jpg" };
            }
            return null;
        });

        // Create layout structure
        const layout = document.createElement("div");
        layout.className = "layout";
        document.body.appendChild(layout);

        const flyout = await Flyout({ variant: "header", direction: "top" });
        layout.appendChild(flyout);

        // Wait for async children to resolve
        await new Promise((resolve) => setTimeout(resolve, 0));

        const avatar = document.querySelector("img.avatar");
        expect(avatar).toBeTruthy();
        expect(avatar?.getAttribute("data-trigger")).toBe("click");
        expect(avatar?.getAttribute("data-event")).toBe("menu");
        expect(avatar?.getAttribute("data-effect")).toBe("submenu");
    });
});
