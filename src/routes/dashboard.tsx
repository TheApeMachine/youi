import { Bars } from "@/lib/ui/charts/Bars";
import { Donut } from "@/lib/ui/charts/Donut";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Calendar } from "@/lib/ui/calendar/Calendar";
import { stateManager } from "@/lib/state";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Flex } from "@/lib/ui/Flex";
import { Icon } from "@/lib/ui/Icon";
import { Link } from "@/lib/ui/Link";
import { Badge } from "@/lib/ui/Badge";
import { Text } from "@/lib/ui/Text";
import { List } from "@/lib/ui/List";
gsap.registerPlugin(Flip);

export const render = Component({
    effect: () => {
        // Get the header avatar
        const headerAvatar = document.querySelector("header img");
        const profileCard = document.querySelector(".profile-card");

        if (!headerAvatar) return;

        // Store initial state
        const state = Flip.getState(headerAvatar);

        // Add dashboard avatar classes
        headerAvatar.classList.add("xl", "ring-double-purple");
        gsap.set(profileCard, {
            height: "+=128px"
        });

        gsap.set("header", {
            marginTop: 0
        });

        // Set new position and size
        gsap.set(headerAvatar, {
            width: "128px",
            height: "128px",
            position: "absolute",
            top: "32px",
            left: "50%",
            xPercent: -50,
            zIndex: 99999
        });

        // Animate from original state
        Flip.from(state, {
            duration: 0.6,
            ease: "power2.inOut",
            absolute: true
        });
    },
    render: () => {
        const user = stateManager.getState("authUser");

        return (
            <Flex background="bg" gap="unit" fullHeight fullWidth>
                <Flex
                    align="start"
                    background="bg"
                    gap="lg"
                    fullWidth
                    fullHeight
                >
                    <Flex
                        direction="column"
                        gap="md"
                        background="bg"
                        fullWidth
                        fullHeight
                    >
                        <Flex
                            direction="column"
                            radius="xs"
                            fullWidth
                            fullHeight
                        >
                            <List
                                items={[
                                    <Link href="/chat">
                                        <Icon icon="mail" />
                                        Messages
                                        <Badge color="brand-light">
                                            <Text
                                                variant="h6"
                                                color="highlight"
                                            >
                                                3
                                            </Text>
                                        </Badge>
                                    </Link>,
                                    <Link href="/dashboard/profile">
                                        <Icon icon="send" />
                                        Invitations
                                        <Badge color="brand-light">
                                            <Text
                                                variant="h6"
                                                color="highlight"
                                            >
                                                3
                                            </Text>
                                        </Badge>
                                    </Link>,
                                    <Link href="/dashboard/logout">
                                        <Icon icon="calendar_month" />
                                        Events
                                        <Badge color="brand-light">
                                            <Text
                                                variant="h6"
                                                color="highlight"
                                            >
                                                3
                                            </Text>
                                        </Badge>
                                    </Link>,
                                    <Link href="/account">
                                        <Icon icon="settings" />
                                        Account Settings
                                    </Link>,
                                    <Link href="/statistics">
                                        <Icon icon="monitoring" />
                                        Statistics
                                    </Link>
                                ]}
                            />
                        </Flex>
                        <Flex
                            direction="column"
                            radius="xs"
                            fullWidth
                            fullHeight
                        >
                            <Donut />
                        </Flex>
                    </Flex>
                    <Flex
                        direction="column"
                        gap="md"
                        background="bg"
                        fullWidth
                        fullHeight
                    >
                        <Flex
                            direction="column"
                            justify="space-between"
                            gap="md"
                            radius="xs"
                            background="muted"
                            fullWidth
                            fullHeight
                        >
                            <div class="profile-card"></div>
                            <Text variant="h3" color="highlight">
                                {user.name}
                            </Text>
                            <Flex
                                align="stretch"
                                justifySelf="end"
                                grow={false}
                                fullWidth
                            >
                                <Link
                                    href="/dashboard/profile"
                                    className="accent-button yellow"
                                >
                                    <Icon icon="forum" /> 6
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    className="accent-button green"
                                >
                                    <Icon icon="visibility" />
                                    14
                                </Link>
                                <Link
                                    href="/dashboard/profile"
                                    className="accent-button red"
                                >
                                    <Icon icon="favorite" />
                                    22
                                </Link>
                            </Flex>
                        </Flex>
                        <Flex
                            direction="column"
                            radius="xs"
                            fullWidth
                            fullHeight
                        >
                            <Flex grow={false} fullWidth>
                                <Text variant="h4">Activity</Text>
                            </Flex>
                            <Flex fullWidth fullHeight>
                                <Bars />
                            </Flex>
                        </Flex>
                    </Flex>
                    <Flex direction="column" radius="xs" fullWidth fullHeight>
                        <Calendar />
                    </Flex>
                </Flex>
            </Flex>
        );
    }
});
