import { jsx } from "@/lib/vdom";
import { Component } from "./Component";
import { stateManager } from "@/lib/state";
import { eventBus } from "@/lib/event";
import type { EventPayload } from "@/lib/event";
import { from } from "@/lib/mongo/query";
import "@/assets/circle.css";
import "@/assets/animation.css";
import { gsap } from "gsap";

export interface Group {
    _id: string;
    GroupName: string;
    ImageURL?: string;
    Roles: number[];
    IsAccountGroup: boolean;
}

interface GroupMember {
    _id: string;
    FirstName?: string;
    ImageURL?: string;
}

interface GroupWithPosition extends Group {
    x: number;
    y: number;
    members?: GroupMember[];
}

// Register state keys if not already done
stateManager.register("selectedGroup", null);
stateManager.register("expandedGroup", null);
stateManager.register("groupMembersMap", {});
stateManager.register("preloadedImages", {});
stateManager.register("currentMemberIndex", 0);

const animateCircleDepth = (element: Element | null, expanded: boolean) => {
    if (!element) return;
    gsap.to(element, {
        scale: expanded ? 2 : 1,
        zIndex: 1000,
        duration: 0.4,
        ease: "power2.out",
        transformOrigin: "center center"
    });
};

export const Circle = Component({
    effect: ({ rootElement }) => {
        let rotationInterval: number | null = null;

        const rotateMemberDisplay = () => {
            const expandedGroup = stateManager.getState("expandedGroup");
            const members = expandedGroup
                ? stateManager.getState("groupMembersMap")[expandedGroup]
                : [];
            if (!members?.length) return;

            const currentIndex = stateManager.getState("currentMemberIndex");
            const nextIndex = (currentIndex + 1) % members.length;

            const svg = rootElement?.querySelector(".circle-svg");
            if (!svg) return;

            const currentMemberEl = svg.querySelector(
                `.member-avatar[data-index="${currentIndex}"]`
            );
            const nextMemberEl = svg.querySelector(
                `.member-avatar[data-index="${nextIndex}"]`
            );

            if (!currentMemberEl || !nextMemberEl) return;

            // Refresh layout
            void currentMemberEl.offsetHeight;
            void nextMemberEl.offsetHeight;

            // Remove return class so we start fresh
            currentMemberEl.classList.remove("return");
            nextMemberEl.classList.remove("return");

            // Ensure next member not currently featured
            nextMemberEl.classList.remove("featured");

            // We use requestAnimationFrame to ensure style changes apply in sequence
            requestAnimationFrame(() => {
                void currentMemberEl.offsetHeight;
                void nextMemberEl.offsetHeight;

                // The current featured member returns to original position
                currentMemberEl.classList.add("return");

                // The next member becomes the new featured one
                nextMemberEl.classList.add("featured");

                // Wait another frame before removing featured from the current one
                requestAnimationFrame(() => {
                    currentMemberEl.classList.remove("featured");
                });
            });

            // Update the displayed name in the center text
            const featuredNameEl = svg.querySelector(".featured-member-name");
            if (featuredNameEl && members[nextIndex]) {
                featuredNameEl.textContent =
                    members[nextIndex].FirstName ?? "Member";
            }

            // Clean up the return animation after it finishes
            const cleanup = () => {
                currentMemberEl.classList.remove("return");
                currentMemberEl.removeEventListener("animationend", cleanup);
            };
            currentMemberEl.addEventListener("animationend", cleanup, {
                once: true
            });

            stateManager.setState({ currentMemberIndex: nextIndex });
        };

        const cleanupExistingElements = (root: Element) => {
            const svg = root.querySelector(".circle-svg");
            const existingContainers =
                svg?.querySelectorAll(".member-container");
            if (!existingContainers || existingContainers.length === 0) {
                return Promise.resolve([]);
            }
            return Promise.all(
                Array.from(existingContainers).map((container) => {
                    return new Promise<void>((resolve) => {
                        container.classList.add("exit");
                        container.addEventListener(
                            "animationend",
                            () => {
                                container.remove();
                                resolve();
                            },
                            { once: true }
                        );
                    });
                })
            );
        };

        // Handle circle-click events to expand/collapse circles and load members
        eventBus.subscribe("circle-click", async (e: EventPayload) => {
            if (!rootElement) return;

            if (!e.effect) {
                // If no effect, collapse everything
                stateManager.setState({
                    selectedGroup: null,
                    expandedGroup: null,
                    currentMemberIndex: 0
                });
                await cleanupExistingElements(rootElement);
                // Clear any rotation interval
                if (rotationInterval) {
                    window.clearInterval(rotationInterval);
                    rotationInterval = null;
                }
                return;
            }

            const currentExpandedGroup = stateManager.getState("expandedGroup");
            const newExpandedGroup =
                currentExpandedGroup === e.effect ? null : e.effect;

            // Clean up before toggling
            await cleanupExistingElements(rootElement);

            stateManager.setState({
                selectedGroup: e.effect,
                expandedGroup: newExpandedGroup,
                currentMemberIndex: 0
            });

            // Update circle states visually
            const circles = rootElement.querySelectorAll(".circle-group");
            circles.forEach((circleGroup: Element) => {
                const groupId = (circleGroup as SVGElement).dataset.effect;
                const mainCircle = circleGroup.querySelector(".circle-main");
                const outerCircle = circleGroup.querySelector(".circle-outer");

                if (groupId === e.effect && newExpandedGroup) {
                    // Selected & Expanded
                    mainCircle?.classList.add("selected");
                    outerCircle?.classList.add("active");
                    outerCircle?.setAttribute("r", "80");
                    mainCircle?.setAttribute("stroke", "var(--brand-light)");
                    mainCircle?.setAttribute("stroke-width", "2");
                    outerCircle?.setAttribute("stroke", "var(--brand-light)");
                    outerCircle?.setAttribute("stroke-width", "1");
                    animateCircleDepth(circleGroup, true);
                } else {
                    // Not selected or collapsed
                    mainCircle?.classList.remove("selected");
                    outerCircle?.classList.remove("active");
                    outerCircle?.setAttribute("r", "60");
                    mainCircle?.removeAttribute("stroke");
                    mainCircle?.removeAttribute("stroke-width");
                    outerCircle?.removeAttribute("stroke");
                    outerCircle?.removeAttribute("stroke-width");
                    animateCircleDepth(circleGroup, false);
                }
            });

            // Dim connections if a group is expanded
            const connections =
                rootElement.querySelectorAll(".circle-connection");
            connections.forEach((conn: Element) => {
                if (newExpandedGroup) {
                    conn.classList.add("dimmed");
                } else {
                    conn.classList.remove("dimmed");
                }
            });

            // If we are collapsing, stop here
            if (!newExpandedGroup) {
                if (rotationInterval) {
                    window.clearInterval(rotationInterval);
                    rotationInterval = null;
                }
                return;
            }

            // Fetch group members if expanding
            const members = await from("User")
                .whereArrayField("Groups", { _id: e.effect })
                .exec();

            const preloadedImages =
                stateManager.getState("preloadedImages") || {};

            // Only preload images we haven't loaded yet
            const unloadedMembers = members.filter(
                (m) => m.ImageURL && !preloadedImages[m.ImageURL]
            );

            if (unloadedMembers.length > 0) {
                const imagePromises = unloadedMembers.map((member) => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => {
                            if (member.ImageURL) {
                                preloadedImages[member.ImageURL] = img;
                                stateManager.setState({ preloadedImages });
                            }
                            resolve(member);
                        };
                        img.onerror = () => {
                            console.warn(
                                "Image failed to preload:",
                                member.ImageURL
                            );
                            resolve(member); // Resolve anyway, fallback will be used
                        };
                        img.src = `${member.ImageURL!}&width=256`;
                    });
                });

                try {
                    await Promise.all(imagePromises);
                } catch (error) {
                    console.error("Error preloading images:", error);
                }
            }

            // Store members in state
            const currentMembersMap =
                stateManager.getState("groupMembersMap") || {};
            stateManager.setState({
                groupMembersMap: {
                    ...currentMembersMap,
                    [e.effect]: members
                }
            });

            // Create and append member avatars
            const svg = rootElement.querySelector(".circle-svg");
            const targetGroup = rootElement.querySelector(
                `[data-effect="${e.effect}"]`
            );
            if (targetGroup && members.length > 0 && svg) {
                // Member container
                const newMemberContainer = document.createElementNS(
                    "http://www.w3.org/2000/svg",
                    "g"
                );
                newMemberContainer.setAttribute("class", "member-container");
                newMemberContainer.setAttribute(
                    "transform",
                    targetGroup.getAttribute("transform") || ""
                );
                newMemberContainer.setAttribute("data-group", e.effect);

                members.forEach((member: GroupMember, index: number) => {
                    const angle =
                        (index / members.length) * 2 * Math.PI - Math.PI / 2;
                    const orbitRadius = 70;
                    const x = orbitRadius * Math.cos(angle);
                    const y = orbitRadius * Math.sin(angle);

                    const memberGroup = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "g"
                    );
                    memberGroup.setAttribute("class", "member-avatar");
                    memberGroup.setAttribute("data-index", index.toString());
                    memberGroup.style.setProperty("--index", index.toString());
                    memberGroup.style.setProperty("--x", `${x}px`);
                    memberGroup.style.setProperty("--y", `${y}px`);
                    memberGroup.style.setProperty(
                        "--total-members",
                        members.length.toString()
                    );

                    // The first member displayed is featured
                    if (index === 0) {
                        memberGroup.classList.add("featured");
                    }

                    // Avatar background
                    const background = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "circle"
                    );
                    background.setAttribute("r", "14");
                    background.setAttribute("class", "avatar-background");
                    memberGroup.appendChild(background);

                    // If image is preloaded use it, otherwise fallback to initials
                    const imageURL =
                        member.ImageURL && preloadedImages[member.ImageURL]
                            ? preloadedImages[member.ImageURL].src
                            : null;

                    if (imageURL) {
                        const image = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "image"
                        );
                        image.setAttribute("href", imageURL);
                        image.setAttribute("x", "-14");
                        image.setAttribute("y", "-14");
                        image.setAttribute("width", "28");
                        image.setAttribute("height", "28");
                        image.setAttribute("class", "avatar-image");
                        image.setAttribute("role", "img");
                        image.setAttribute(
                            "aria-label",
                            member.FirstName || "Member"
                        );

                        // Unique clipPath for each member
                        const clipPath = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "clipPath"
                        );
                        const clipId = `avatar-clip-${member._id}`;
                        clipPath.setAttribute("id", clipId);

                        const clipCircle = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "circle"
                        );
                        clipCircle.setAttribute("cx", "0");
                        clipCircle.setAttribute("cy", "0");
                        clipCircle.setAttribute("r", "14");
                        clipPath.appendChild(clipCircle);
                        memberGroup.appendChild(clipPath);

                        image.setAttribute("clip-path", `url(#${clipId})`);
                        memberGroup.appendChild(image);
                    } else {
                        // Fallback: use initials if no image
                        const initials = (member.FirstName || "M")
                            .slice(0, 1)
                            .toUpperCase();
                        const textEl = document.createElementNS(
                            "http://www.w3.org/2000/svg",
                            "text"
                        );
                        textEl.setAttribute("x", "0");
                        textEl.setAttribute("y", "4");
                        textEl.setAttribute("text-anchor", "middle");
                        textEl.setAttribute("class", "fallback-initials");
                        textEl.textContent = initials;
                        memberGroup.appendChild(textEl);
                    }

                    // Accessible label
                    memberGroup.setAttribute("role", "img");
                    memberGroup.setAttribute(
                        "aria-label",
                        member.FirstName || "Member"
                    );

                    newMemberContainer.appendChild(memberGroup);
                });

                svg.appendChild(newMemberContainer);

                // Add a name display in the center for the featured member
                let featuredNameEl = svg.querySelector(".featured-member-name");
                if (!featuredNameEl) {
                    featuredNameEl = document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "text"
                    );
                    featuredNameEl.setAttribute(
                        "class",
                        "featured-member-name"
                    );
                    featuredNameEl.setAttribute("x", "400");
                    featuredNameEl.setAttribute("y", "300");
                    featuredNameEl.setAttribute("text-anchor", "middle");
                    featuredNameEl.setAttribute(
                        "alignment-baseline",
                        "central"
                    );
                    featuredNameEl.setAttribute("fill", "var(--lighter)");
                    featuredNameEl.setAttribute("font-size", "16");
                    featuredNameEl.setAttribute("font-weight", "600");
                    svg.appendChild(featuredNameEl);
                }
                featuredNameEl.textContent = members[0].FirstName ?? "Member";

                // Start rotation interval for member display
                if (rotationInterval) {
                    window.clearInterval(rotationInterval);
                    rotationInterval = null;
                }
                setTimeout(() => {
                    rotationInterval = window.setInterval(
                        rotateMemberDisplay,
                        3500
                    );
                }, 1000);
            } else {
                // If no members, just clear any intervals
                if (rotationInterval) {
                    window.clearInterval(rotationInterval);
                    rotationInterval = null;
                }
            }
        });

        // Handle direct clicks on circles
        if (rootElement) {
            rootElement.addEventListener("click", (e: Event) => {
                const target = e.target as SVGElement;
                const clickable = target.closest(
                    '[data-event="circle-click"]'
                ) as SVGElement;
                if (clickable) {
                    eventBus.publish("circle-click", {
                        effect: clickable.dataset.effect,
                        topic: clickable.dataset.topic,
                        trigger: "click",
                        originalEvent: e
                    });
                }
            });
        }

        // Cleanup on unmount
        return () => {
            eventBus.unsubscribe("circle-click", () => { });
            if (rootElement) {
                rootElement.removeEventListener("click", () => { });
            }
            stateManager.setState({ groupMembersMap: {} });
            if (rotationInterval) {
                window.clearInterval(rotationInterval);
                rotationInterval = null;
            }
        };
    },

    render: async () => {
        const user = stateManager.getState("user")[0];
        if (!user) return null;

        const selectedGroup = stateManager.getState("selectedGroup");
        const expandedGroup = stateManager.getState("expandedGroup");
        const groupMembersMap = stateManager.getState("groupMembersMap") || {};

        // Layout calculations
        const groups = (user.Groups || []) as Group[];
        const centerX = 400;
        const centerY = 300;
        const radius = 180;

        const groupsWithPositions: GroupWithPosition[] = groups.map(
            (group: Group, index: number) => {
                const angle =
                    (index / groups.length) * 2 * Math.PI - Math.PI / 2;
                return {
                    ...group,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                    members:
                        group._id === expandedGroup
                            ? groupMembersMap[group._id]
                            : undefined
                };
            }
        );

        // Connection calculations based on shared roles
        const connections = groups.flatMap((group: Group, i: number) =>
            groups
                .slice(i + 1)
                .map((otherGroup: Group) => {
                    const commonRoles = group.Roles.filter((role) =>
                        otherGroup.Roles.includes(role)
                    );
                    if (commonRoles.length === 0) return null;

                    return {
                        source: group._id,
                        target: otherGroup._id,
                        strength: commonRoles.length
                    };
                })
                .filter(Boolean)
        );

        // Curved connection paths
        const connectionPaths = connections
            .map((conn) => {
                if (!conn) return null;
                const source = groupsWithPositions.find(
                    (g) => g._id === conn.source
                );
                const target = groupsWithPositions.find(
                    (g) => g._id === conn.target
                );
                if (!source || !target) return null;

                const midX = (source.x + target.x) / 2;
                const midY = (source.y + target.y) / 2;
                const dx = target.x - source.x;
                const dy = target.y - source.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const offset = 50;
                const normalX = (-dy / dist) * offset;
                const normalY = (dx / dist) * offset;

                return {
                    id: `${conn.source}-${conn.target}`,
                    path: `M ${source.x} ${source.y} Q ${midX + normalX} ${midY + normalY
                        } ${target.x} ${target.y}`,
                    strength: conn.strength
                };
            })
            .filter((path): path is NonNullable<typeof path> => path !== null);

        return (
            <div class="circle-container">
                <div class="circle-svg-container">
                    <svg viewBox="-50 -50 900 700" class="circle-svg">
                        <defs>
                            <clipPath id="avatar-clip">
                                <circle cx="0" cy="0" r="14" />
                            </clipPath>
                            <filter id="glow">
                                <feGaussianBlur
                                    stdDeviation="3"
                                    result="coloredBlur"
                                />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Connection lines */}
                        {connectionPaths.map((conn) => (
                            <g key={conn.id}>
                                <path
                                    d={conn.path}
                                    fill="none"
                                    strokeWidth={conn.strength}
                                    strokeLinecap="round"
                                    class={`circle-connection ${selectedGroup ? "dimmed" : ""
                                        }`}
                                />
                            </g>
                        ))}

                        {/* Groups */}
                        {groupsWithPositions.map((group: GroupWithPosition) => {
                            const isSelected = selectedGroup === group._id;
                            const isExpanded = expandedGroup === group._id;
                            const hasCommonRoles =
                                selectedGroup &&
                                selectedGroup !== group._id &&
                                connections.some(
                                    (conn) =>
                                        conn &&
                                        ((conn.source === selectedGroup &&
                                            conn.target === group._id) ||
                                            (conn.target === selectedGroup &&
                                                conn.source === group._id))
                                );

                            return (
                                <g
                                    transform={`translate(${group.x},${group.y})`}
                                    data-event="circle-click"
                                    data-effect={group._id}
                                    data-topic="group"
                                    class="circle-group"
                                    role="img"
                                    aria-label={`Group: ${group.GroupName}`}
                                >
                                    <circle
                                        r={isExpanded ? 80 : 60}
                                        class={`circle-outer ${isSelected || isExpanded
                                                ? "active"
                                                : ""
                                            }`}
                                        filter="url(#glow)"
                                    />
                                    <circle
                                        r={50}
                                        class={`circle-main ${isSelected
                                                ? "selected"
                                                : hasCommonRoles
                                                    ? "connected"
                                                    : selectedGroup
                                                        ? "inactive"
                                                        : ""
                                            }`}
                                        filter="url(#glow)"
                                    />
                                    <g class="text-content">
                                        <text
                                            x="0"
                                            y="0"
                                            class="group-name"
                                            text-anchor="middle"
                                            alignment-baseline="central"
                                            fill="var(--lighter)"
                                            stroke="var(--brand)"
                                            stroke-width="0.5"
                                            font-size="12"
                                            font-weight="500"
                                        >
                                            {group.GroupName}
                                        </text>
                                    </g>
                                </g>
                            );
                        })}

                        {/* The featured member's name text is appended dynamically in code if needed */}
                    </svg>
                </div>
            </div>
        );
    }
});
