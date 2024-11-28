import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Button } from "../button/Button";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { eventBus, EventPayload } from "@/lib/event";

gsap.registerPlugin(Flip);

export type NavigationItem = {
    href: string;
    icon: string;
    label: string;
    submenu?: NavigationItem[];
};

interface NavigationProps {
    items: NavigationItem[];
}

type MenuState = "expanded" | "collapsed";
type MenuStateKey =
    | "topLevel"
    | "submenu"
    | "target"
    | "buttonFace"
    | "children"
    | "closeIcon";

const menuStates = {
    topLevel: { height: ["auto", 0], opacity: [1, 0] },
    submenu: {
        height: [0, "auto"],
        width: [0, "auto"],
        opacity: [0, 1]
    },
    target: {
        gridColumn: ["auto", "1 / -1"],
        gridRow: ["auto", "1 / -1"],
        gap: [0, "1rem"]
    },
    buttonFace: {
        flexDirection: ["column", "row"],
        width: ["auto", "100%"]
    },
    children: {
        height: [0, "auto"],
        opacity: [0, 1]
    },
    closeIcon: {
        fontSize: [0, "2rem"],
        opacity: [0, 1]
    }
};

const animateMenu = (
    elements: {
        target: HTMLElement;
        submenu: Element | null;
        topLevel: Element[];
        children: NodeListOf<Element>;
    },
    state: MenuState
) => {
    if (!elements.submenu) return;

    console.log("Starting animation for state:", state);

    const flipState = Flip.getState(
        [elements.target, elements.submenu, ...elements.topLevel],
        { props: "all" }
    );

    console.log("Got FLIP state:", flipState);

    const isExpanded = state === "expanded";
    const i = +isExpanded;

    console.log("Target:", elements.target);
    console.log("Submenu:", elements.submenu);
    console.log("TopLevel:", elements.topLevel);
    console.log("ButtonFace:", elements.target.querySelector(".button-face"));
    console.log("Children:", elements.children);
    console.log(
        "CloseIcon:",
        elements.target.querySelector(".material-icons.close")
    );

    const elementMap: Record<
        keyof typeof menuStates,
        Element | Element[] | NodeListOf<Element> | null
    > = {
        topLevel: elements.topLevel,
        submenu: elements.submenu,
        target: elements.target,
        buttonFace: elements.target.querySelector(".button-face"),
        children: elements.children,
        closeIcon: elements.target.querySelector(".material-icons.close")
    };

    Object.entries(menuStates).forEach(([key, props]) => {
        const element = elementMap[key as keyof typeof menuStates];
        console.log(`Setting ${key} properties:`, props, "on:", element);
        gsap.set(
            element,
            Object.fromEntries(
                Object.entries(props).map(([prop, values]) => [prop, values[i]])
            )
        );
    });

    if (state === "expanded") {
        elements.target.setAttribute("data-expanded", "true");
    } else {
        elements.target.removeAttribute("data-expanded");
    }

    console.log("Starting FLIP animation");
    const animation = Flip.from(flipState, {
        duration: 0.5,
        ease: "power1.inOut",
        onComplete: () => console.log("FLIP animation complete")
    });
    console.log("FLIP animation created:", animation);

    return animation;
};

export const Navigation = Component<NavigationProps>({
    effect: () => {
        eventBus.subscribe("menu", (e: EventPayload) => {
            const target = e.originalEvent?.target as HTMLElement;
            if (!target) return;

            const effect = e.effect;
            const nav = target.closest("nav");
            if (!nav) return;

            if (effect === "close") {
                const expandedButton = nav.querySelector(
                    "[data-expanded='true']"
                );
                if (!expandedButton) return;

                const elements = {
                    target: expandedButton as HTMLElement,
                    submenu: expandedButton.querySelector(".button-submenu"),
                    topLevel: Array.from(nav.querySelectorAll("a")),
                    children: expandedButton.querySelectorAll("a")
                };

                animateMenu(elements, "collapsed");
                return;
            }

            const elements = {
                target,
                submenu: target.querySelector(".button-submenu"),
                topLevel: Array.from(nav.querySelectorAll("a")).filter(
                    (a) => a != target
                ),
                children: target.querySelectorAll("a")
            };

            animateMenu(elements, "expanded");
        });

        eventBus.subscribe("dialog", (e: EventPayload) => {
            console.log("dialog", e);
            const dialog = document.querySelector(
                "dialog.modal"
            ) as HTMLDialogElement;
            if (e.effect === "close" && dialog) {
                dialog.close();
                dialog.style.display = "none";
            }
        });
    },
    render: ({ items }) => {
        const renderItem = (item: NavigationItem) =>
            item.submenu ? (
                <Button
                    variant="button"
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                    data-trigger="click"
                    data-event="menu"
                >
                    <div className="button-submenu">
                        {item.submenu.map(renderItem)}
                    </div>
                </Button>
            ) : (
                <Button
                    variant="menu"
                    icon={item.icon}
                    label={item.label}
                    href={item.href}
                />
            );

        return <nav>{items.map(renderItem)}</nav>;
    }
});
