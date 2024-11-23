import React, { useState, useEffect, useRef } from "react";

const FixedMagnifierList = () => {
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeout = useRef(null);

    const normalHeight = 150;
    const magnifiedHeight = 300;

    const items = [
        {
            title: "Flipside",
            description:
                "A button that seamlessly transitions from action to confirmation."
        },
        {
            title: "Sketch Toy",
            description:
                "Draw sketches with shaky lines and share replays with friends."
        },
        {
            title: "Slides",
            description:
                "A platform for creating, presenting and sharing slide decks."
        },
        {
            title: "Progress Nav",
            description:
                "An animated progress bar that highlights sections of a page."
        },
        {
            title: "Ladda",
            description:
                "UI concept which merges loading indicators into the buttons."
        }
    ];

    useEffect(() => {
        document.body.style.height = "500vh";
        document.body.style.margin = "0";
        document.body.style.backgroundColor = "#222";

        const handleScroll = () => {
            // Clear previous timeout
            if (scrollTimeout.current) {
                clearTimeout(scrollTimeout.current);
            }

            setIsScrolling(true);

            // Get current scroll position
            const scrollRange =
                document.documentElement.scrollHeight - window.innerHeight;
            const newPosition = Math.max(
                0,
                Math.min(1, window.scrollY / scrollRange)
            );
            setScrollPosition(newPosition);

            // Set timeout to detect when scrolling stops
            scrollTimeout.current = setTimeout(() => {
                setIsScrolling(false);
                snapToNearestPost(newPosition);
            }, 150); // Adjust timeout as needed
        };

        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        };
    }, []);

    const snapToNearestPost = (currentPosition) => {
        const totalPosts = items.length;
        const scrollRange =
            document.documentElement.scrollHeight - window.innerHeight;

        // Calculate which post should be in view
        const currentPostIndex = Math.round(currentPosition * (totalPosts - 1));
        const targetPosition = currentPostIndex / (totalPosts - 1);

        // Smoothly scroll to target position
        const targetScrollY = targetPosition * scrollRange;
        window.scrollTo({
            top: targetScrollY,
            behavior: "smooth"
        });
    };

    // Calculate dimensions
    const topSectionHeight = window.innerHeight * 0.4;
    const magnifierHeight = magnifiedHeight;
    const totalScrollHeight = items.length * normalHeight;
    const magnifiedScrollHeight = items.length * magnifiedHeight;

    // Calculate positions
    const topPosition = topSectionHeight + -scrollPosition * totalScrollHeight;
    const middlePosition =
        -scrollPosition * (magnifiedScrollHeight - magnifierHeight);
    const bottomPosition = -scrollPosition * totalScrollHeight;

    const listStyle = {
        position: "relative",
        width: "420px",
        margin: "0 auto",
        transition: isScrolling
            ? "transform 0.1s ease-out"
            : "transform 0.3s ease-out"
    };

    const normalItemStyle = {
        position: "absolute",
        left: 0,
        right: 0,
        height: normalHeight + "px",
        padding: "20px",
        backgroundColor: "#f5f5f5"
    };

    const magnifiedItemStyle = {
        position: "absolute",
        left: 0,
        right: 0,
        height: magnifiedHeight + "px",
        padding: "40px",
        backgroundColor: "#fff"
    };

    return (
        <div
            style={{
                position: "fixed",
                top: "0",
                left: "50%",
                transform: "translateX(-50%)",
                width: "840px",
                height: "100vh",
                zIndex: 1000
            }}
        >
            {/* Top Section */}
            <div
                style={{
                    position: "absolute",
                    top: "0",
                    width: "100%",
                    height: topSectionHeight + "px",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        ...listStyle,
                        transform: `translateY(${topPosition}px)`
                    }}
                >
                    {items.map((item, index) => (
                        <div
                            key={`top-${index}`}
                            style={{
                                ...normalItemStyle,
                                top: index * normalHeight + "px"
                            }}
                        >
                            <h3 style={{ margin: "0 0 8px 0" }}>
                                {item.title}
                            </h3>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    color: "#666"
                                }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Middle Magnified Section */}
            <div
                style={{
                    position: "absolute",
                    top: topSectionHeight + "px",
                    width: "100%",
                    height: magnifierHeight + "px",
                    overflow: "hidden",
                    zIndex: 2,
                    boxShadow: "0 0 30px rgba(0,0,0,0.2)"
                }}
            >
                <div
                    style={{
                        ...listStyle,
                        width: "840px",
                        transform: `translateY(${middlePosition}px)`
                    }}
                >
                    {items.map((item, index) => (
                        <div
                            key={`middle-${index}`}
                            style={{
                                ...magnifiedItemStyle,
                                top: index * magnifiedHeight + "px"
                            }}
                        >
                            <h3
                                style={{
                                    margin: "0 0 12px 0",
                                    fontSize: "24px"
                                }}
                            >
                                {item.title}
                            </h3>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "18px",
                                    color: "#666"
                                }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Section */}
            <div
                style={{
                    position: "absolute",
                    top: topSectionHeight + magnifierHeight + "px",
                    bottom: "0",
                    width: "100%",
                    overflow: "hidden"
                }}
            >
                <div
                    style={{
                        ...listStyle,
                        transform: `translateY(${bottomPosition}px)`
                    }}
                >
                    {items.map((item, index) => (
                        <div
                            key={`bottom-${index}`}
                            style={{
                                ...normalItemStyle,
                                top: index * normalHeight + "px"
                            }}
                        >
                            <h3 style={{ margin: "0 0 8px 0" }}>
                                {item.title}
                            </h3>
                            <p
                                style={{
                                    margin: 0,
                                    fontSize: "14px",
                                    color: "#666"
                                }}
                            >
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FixedMagnifierList;
