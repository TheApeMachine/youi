import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Text } from "@/lib/ui/Text";
import { Button } from "../button/Button";
import gsap from "gsap";
import Flip from "gsap/Flip";
import { eventBus } from "@/lib/event";
import { EventPayload } from "@/lib/event/types";
import { Icon } from "../Icon";

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

    const flipState = Flip.getState(
        [elements.target, elements.submenu, ...elements.topLevel],
        { props: "all" }
    );

    const isExpanded = state === "expanded";
    const i = +isExpanded;

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

    return Flip.from(flipState, {
        duration: 0.5,
        ease: "power1.inOut"
    });
};

export const Navigation = Component({
    effect: () => {
        eventBus.subscribe("menu", (e: EventPayload) => {
            const target = e.meta?.originalEvent?.target as HTMLElement;
            if (!target) return;

            const nav = target.closest<HTMLElement>("nav");
            if (!nav) return;

            // Handle submenu buttons
            if (target.closest("[data-effect='submenu']")) {
                const targetButton = target.closest(
                    "[data-effect='submenu']"
                ) as HTMLElement;
                const elements = {
                    target: targetButton,
                    submenu: targetButton.querySelector(".button-submenu"),
                    topLevel: Array.from(nav.querySelectorAll("a")).filter(
                        (a) => a != targetButton
                    ),
                    children: targetButton.querySelectorAll("a")
                };

                animateMenu(elements, "expanded");
                return;
            }

            // Handle close button
            if (target.closest(".close")) {
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
            }
        });
    },
    render: ({ items }: NavigationProps) => {
        const renderItem = (item: NavigationItem) =>
            item.submenu ? (
                <Button
                    variant="keypad"
                    icon={item.icon}
                    trigger="click"
                    event="menu"
                    effect="submenu"
                    url={item.href}
                >
                    <Text variant="h4">{item.label}</Text>
                    <div className="button-face">
                        <Icon icon="arrow_back" />
                    </div>
                    <div className="button-submenu">
                        {item.submenu.map(renderItem)}
                    </div>
                </Button>
            ) : (
                <Button
                    variant="keypad"
                    icon={item.icon}
                    trigger="click"
                    event="navigate"
                    effect={item.href}
                >
                    <Text variant="h4">{item.label}</Text>
                </Button>
            );

        return <nav>{items.map(renderItem)}</nav>;
    }
});
