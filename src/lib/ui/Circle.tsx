import { jsx } from "@/lib/template";
import { Component } from "./Component";
import { stateManager } from "@/lib/state";
import { eventBus } from "@/lib/event";
import type { EventPayload } from "@/lib/event";
import { Flex } from "./Flex";
import "@/assets/circle.css";

export interface Group {
    _id: string;
    GroupName: string;
    ImageURL?: string;
    Roles: number[];
    IsAccountGroup: boolean;
}

interface GroupWithPosition extends Group {
    x: number;
    y: number;
}

interface CircleData {
    user: {
        Groups: Group[];
    };
}

// Register state keys
stateManager.register("selectedGroup", null);
stateManager.register("expandedGroup", null);

export const Circle = Component({
    effect: ({ rootElement }) => {
        // Subscribe to circle click events
        eventBus.subscribe("circle-click", (e: EventPayload) => {
            if (!e.effect) {
                // Reset both states
                stateManager.setState({ key: "selectedGroup", value: null });
                stateManager.setState({ key: "expandedGroup", value: null });
                return;
            }

            // Set selected group
            stateManager.setState({ key: "selectedGroup", value: e.effect });

            // Toggle expanded group
            const current = stateManager.getState("expandedGroup");
            stateManager.setState({
                key: "expandedGroup",
                value: current === e.effect ? null : e.effect
            });
        });

        // Cleanup function
        return () => {
            eventBus.unsubscribe("circle-click", () => {});
        };
    },

    render: async () => {
        const user = stateManager.getState("user")[0];
        if (!user) return null;

        const selectedGroup = stateManager.getState("selectedGroup");
        const expandedGroup = stateManager.getState("expandedGroup");

        // Calculate positions and connections based on user's groups
        const groups = (user.Groups || []) as Group[];
        const centerX = 400;
        const centerY = 300;
        const radius = 180;

        // Calculate positions for groups in a circle
        const groupsWithPositions: GroupWithPosition[] = groups.map(
            (group: Group, index: number) => {
                const angle =
                    (index / groups.length) * 2 * Math.PI - Math.PI / 2;
                return {
                    ...group,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle)
                };
            }
        );

        // Calculate connections between groups based on roles
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

        // Calculate connection paths with curved lines
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
                const normalX = (-dy / Math.sqrt(dx * dx + dy * dy)) * 50;
                const normalY = (dx / Math.sqrt(dx * dx + dy * dy)) * 50;

                return {
                    id: `${conn.source}-${conn.target}`,
                    path: `M ${source.x} ${source.y} Q ${midX + normalX} ${
                        midY + normalY
                    } ${target.x} ${target.y}`,
                    strength: conn.strength
                };
            })
            .filter((path): path is NonNullable<typeof path> => path !== null);

        return (
            <div class="circle-container">
                <div class="circle-svg-container">
                    <svg viewBox="0 0 800 600" class="circle-svg">
                        <defs>
                            <marker
                                id="circle"
                                viewBox="0 0 10 10"
                                refX="5"
                                refY="5"
                                markerWidth="3"
                                markerHeight="3"
                            >
                                <circle
                                    cx="5"
                                    cy="5"
                                    r="4"
                                    fill="currentColor"
                                />
                            </marker>
                        </defs>

                        {/* Connection lines */}
                        {connectionPaths.map((conn) => (
                            <g key={conn.id}>
                                <path
                                    d={conn.path}
                                    fill="none"
                                    stroke={
                                        selectedGroup ? "#E5E7EB" : "#94A3B8"
                                    }
                                    strokeWidth={conn.strength}
                                    strokeLinecap="round"
                                    class="circle-connection"
                                    opacity={selectedGroup ? 0.3 : 0.6}
                                />
                            </g>
                        ))}

                        {/* Group circles */}
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

                            const highlightClass = isSelected
                                ? "circle-highlight-selected"
                                : hasCommonRoles
                                ? "circle-highlight-connected"
                                : selectedGroup
                                ? "circle-highlight-inactive"
                                : "circle-highlight-default";

                            const labelClass =
                                isSelected || hasCommonRoles
                                    ? "circle-label circle-label-highlighted"
                                    : selectedGroup
                                    ? "circle-label circle-label-inactive"
                                    : "circle-label circle-label-default";

                            return (
                                <g
                                    key={group._id}
                                    transform={`translate(${group.x}, ${group.y})`}
                                    data-trigger="click"
                                    data-event="circle-click"
                                    data-effect={group._id}
                                    data-topic="group"
                                    class="circle-node"
                                >
                                    {/* Highlight circle */}
                                    <circle
                                        r="32"
                                        class={`circle-highlight ${highlightClass}`}
                                    />

                                    {/* Group image or initial */}
                                    {group.ImageURL ? (
                                        <image
                                            href={group.ImageURL}
                                            x="-24"
                                            y="-24"
                                            width="48"
                                            height="48"
                                            clipPath="circle(24px at center)"
                                        />
                                    ) : (
                                        <text
                                            x="0"
                                            y="8"
                                            textAnchor="middle"
                                            class="circle-text"
                                        >
                                            {group.GroupName[0]}
                                        </text>
                                    )}

                                    {/* Group name */}
                                    <text
                                        x="0"
                                        y="48"
                                        textAnchor="middle"
                                        class={labelClass}
                                    >
                                        {group.GroupName}
                                    </text>

                                    {/* Expanded info */}
                                    {isExpanded && (
                                        <foreignObject
                                            x="-120"
                                            y="60"
                                            width="240"
                                            height="120"
                                        >
                                            <div class="circle-info">
                                                <p class="circle-info-title">
                                                    {group.GroupName}
                                                </p>
                                                <p class="circle-info-text">
                                                    {group.Roles.length} Roles
                                                </p>
                                                {group.IsAccountGroup && (
                                                    <p class="circle-info-account">
                                                        Account Group
                                                    </p>
                                                )}
                                            </div>
                                        </foreignObject>
                                    )}
                                </g>
                            );
                        })}
                    </svg>
                </div>
            </div>
        );
    }
});
