import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Flex } from "@/lib/ui/Flex";
import { Text } from "@/lib/ui/Text";
import { List } from "@/lib/ui/List";
import { Icon } from "@/lib/ui/Icon";
import { Badge } from "@/lib/ui/Badge";
import { from } from "@/lib/mongo/query";
import { Bars } from "@/lib/ui/charts/Bars";

export const render = Component({
    loader: () => ({
        allFeedback: from("Feedback270")
            .where({})
            .sortBy("Created", "desc")
            .limit(10)
            .exec()
    }),
    render: ({ data }: { data: { allFeedback: any[] } }) => {
        if (!data) {
            return (
                <Flex pad="lg" justify="center" align="center">
                    <Text>Loading...</Text>
                </Flex>
            );
        }

        const feedbackData = data.allFeedback || [];

        return (
            <Flex
                background="bg"
                pad="lg"
                gap="unit"
                fullWidth
                fullHeight
                scrollable
            >
                <Flex direction="column" gap="lg" fullWidth>
                    <Text variant="h2" color="highlight">
                        Feedback Requests
                    </Text>

                    <List
                        items={feedbackData.map((feedback: any) => (
                            <Flex
                                direction="column"
                                background="bg-glass"
                                border="1px solid var(--muted)"
                                pad="xs"
                                radius="xs"
                                gap="sm"
                            >
                                {/* Title and Status */}
                                <Flex
                                    justify="space-between"
                                    align="center"
                                    gap="lg"
                                    fullWidth
                                >
                                    <Text variant="h5">{feedback.Name}</Text>
                                    <Icon icon="work" size="sm" />
                                    <Text variant="sub">
                                        {feedback.Challenges?.[0]?.Function ||
                                            "N/A"}
                                    </Text>
                                    <Icon icon="calendar_today" size="sm" />
                                    <Text variant="sub">
                                        {new Date(
                                            feedback.Start
                                        ).toLocaleDateString()}
                                    </Text>
                                    <Badge
                                        color={
                                            feedback.HasStarted
                                                ? "brand-light"
                                                : "muted"
                                        }
                                    >
                                        <Text variant="h6" color="highlight">
                                            {feedback.HasStarted
                                                ? "Active"
                                                : "Pending"}
                                        </Text>
                                    </Badge>
                                </Flex>
                                <Flex fullWidth>
                                    <Bars
                                        completed={
                                            feedback.UsersStarted?.length || 0
                                        }
                                        total={feedback.MinimumRespondents}
                                    />
                                </Flex>
                            </Flex>
                        ))}
                    />
                </Flex>
            </Flex>
        );
    }
});
