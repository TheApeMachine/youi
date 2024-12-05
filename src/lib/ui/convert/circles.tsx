import React, { useState } from "react";
import { Card } from "@/components/ui/card";

const GroupVisualization = () => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [expandedGroup, setExpandedGroup] = useState(null);

    // Complete groups data
    const groups = [
        {
            id: 1,
            name: "Mental Health Support",
            members: [
                { id: 1, name: "Alex K.", image: "/api/placeholder/32/32" },
                { id: 2, name: "Sarah M.", image: "/api/placeholder/32/32" },
                { id: 3, name: "James L.", image: "/api/placeholder/32/32" },
                { id: 4, name: "Emma W.", image: "/api/placeholder/32/32" },
                { id: 5, name: "Michael P.", image: "/api/placeholder/32/32" },
                { id: 6, name: "Lisa R.", image: "/api/placeholder/32/32" }
            ],
            color: "#34D399"
        },
        {
            id: 2,
            name: "Fitness & Exercise",
            members: [
                { id: 7, name: "Tom H.", image: "/api/placeholder/32/32" },
                { id: 8, name: "Anna B.", image: "/api/placeholder/32/32" },
                { id: 9, name: "Chris M.", image: "/api/placeholder/32/32" },
                { id: 10, name: "Diana K.", image: "/api/placeholder/32/32" }
            ],
            color: "#60A5FA"
        },
        {
            id: 3,
            name: "Work-Life Balance",
            members: [
                { id: 11, name: "Peter S.", image: "/api/placeholder/32/32" },
                { id: 12, name: "Mary J.", image: "/api/placeholder/32/32" },
                { id: 13, name: "Robert N.", image: "/api/placeholder/32/32" }
            ],
            color: "#F472B6"
        },
        {
            id: 4,
            name: "Meditation",
            members: [
                { id: 14, name: "Sophie L.", image: "/api/placeholder/32/32" },
                { id: 15, name: "David W.", image: "/api/placeholder/32/32" },
                { id: 16, name: "Rachel G.", image: "/api/placeholder/32/32" }
            ],
            color: "#A78BFA"
        }
    ];

    const connections = [
        { source: 1, target: 2, strength: 5 },
        { source: 1, target: 3, strength: 3 },
        { source: 2, target: 4, strength: 4 },
        { source: 3, target: 4, strength: 2 }
    ];

    // Calculate positions for circles in a circular layout
    const centerX = 400;
    const centerY = 300;
    const radius = 180;

    const getCirclePosition = (index, total) => {
        const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
        return {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
        };
    };

    // Calculate member positions around a circle
    const getMemberPosition = (memberIndex, totalMembers) => {
        const angle = (memberIndex / totalMembers) * 2 * Math.PI - Math.PI / 2;
        const orbitRadius = 70; // Reduced radius to keep avatars within the outer ring
        return {
            x: orbitRadius * Math.cos(angle),
            y: orbitRadius * Math.sin(angle)
        };
    };

    // Calculate positions for each group
    const groupsWithPositions = groups.map((group, index) => ({
        ...group,
        ...getCirclePosition(index, groups.length)
    }));

    // Generate connection paths
    const connectionPaths = connections.map((conn) => {
        const source = groupsWithPositions.find((g) => g.id === conn.source);
        const target = groupsWithPositions.find((g) => g.id === conn.target);

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
    });

    const handleGroupHover = (groupId) => {
        setSelectedGroup(groupId);
    };

    const handleGroupClick = (groupId) => {
        setExpandedGroup(expandedGroup === groupId ? null : groupId);
    };

    return (
        <Card className="w-full max-w-4xl mx-auto p-6">
            <div className="w-full aspect-video relative">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                    <defs>
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

                        {/* Add a rotating animation */}
                        <animateTransform
                            id="rotate"
                            attributeName="transform"
                            attributeType="XML"
                            type="rotate"
                            dur="20s"
                            repeatCount="indefinite"
                            from="0 0 0"
                            to="360 0 0"
                        />
                    </defs>

                    {/* Connection lines */}
                    {connectionPaths.map((conn) => (
                        <g key={conn.id}>
                            <path
                                d={conn.path}
                                fill="none"
                                stroke={selectedGroup ? "#E5E7EB" : "#94A3B8"}
                                strokeWidth={conn.strength}
                                strokeLinecap="round"
                                className="transition-colors duration-300"
                                opacity={selectedGroup ? 0.3 : 0.6}
                            />
                        </g>
                    ))}

                    {/* Group circles */}
                    {groupsWithPositions.map((group) => (
                        <g
                            key={group.id}
                            transform={`translate(${group.x},${group.y})`}
                            onMouseEnter={() => handleGroupHover(group.id)}
                            onMouseLeave={() => handleGroupHover(null)}
                            onClick={() => handleGroupClick(group.id)}
                            style={{ cursor: "pointer" }}
                        >
                            {/* Outer expanding circle */}
                            <circle
                                r={expandedGroup === group.id ? 80 : 60}
                                fill={group.color}
                                opacity={
                                    selectedGroup === group.id ||
                                    expandedGroup === group.id
                                        ? 0.2
                                        : 0.1
                                }
                                className="transition-all duration-500 ease-out"
                            />

                            {/* Main circle */}
                            <circle
                                r={50}
                                fill={group.color}
                                opacity={
                                    selectedGroup === group.id ||
                                    expandedGroup === group.id
                                        ? 1
                                        : 0.8
                                }
                                filter="url(#glow)"
                                className="transition-all duration-300"
                            />

                            {/* Member count */}
                            <text
                                y="-10"
                                textAnchor="middle"
                                fill="white"
                                className="text-lg font-bold"
                            >
                                {group.members.length}
                            </text>

                            <text
                                y="10"
                                textAnchor="middle"
                                fill="white"
                                className="text-sm"
                            >
                                members
                            </text>

                            {/* Group name */}
                            <text
                                y="80"
                                textAnchor="middle"
                                fill="#1F2937"
                                className="text-sm font-medium"
                            >
                                {group.name}
                            </text>

                            {/* Member avatars */}
                            {expandedGroup === group.id && (
                                <g>
                                    {group.members.map((member, index) => {
                                        const position = getMemberPosition(
                                            index,
                                            group.members.length
                                        );
                                        return (
                                            <g
                                                key={member.id}
                                                transform={`translate(${position.x},${position.y})`}
                                                className="opacity-0 animate-fade-in"
                                            >
                                                <circle
                                                    r={12}
                                                    fill="white"
                                                    className="animate-scale-in"
                                                />
                                                <image
                                                    href={member.image}
                                                    x="-12"
                                                    y="-12"
                                                    width="24"
                                                    height="24"
                                                    className="rounded-full"
                                                />
                                                <animateTransform
                                                    attributeName="transform"
                                                    type="rotate"
                                                    from="0 0 0"
                                                    to="360 0 0"
                                                    dur="20s"
                                                    repeatCount="indefinite"
                                                />
                                            </g>
                                        );
                                    })}
                                </g>
                            )}
                        </g>
                    ))}
                </svg>

                <style jsx>{`
                    @keyframes scale-in {
                        from {
                            transform: scale(0);
                            opacity: 0;
                        }
                        to {
                            transform: scale(1);
                            opacity: 1;
                        }
                    }

                    @keyframes fade-in {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }

                    .animate-scale-in {
                        animation: scale-in 0.3s ease-out forwards;
                    }

                    .animate-fade-in {
                        animation: fade-in 0.3s ease-out forwards;
                        animation-delay: calc(var(--index) * 50ms);
                    }
                `}</style>
            </div>
        </Card>
    );
};

export default GroupVisualization;
