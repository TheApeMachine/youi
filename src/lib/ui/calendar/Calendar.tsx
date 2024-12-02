import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import "@/assets/calendar.css";
import { Flex } from "../Flex";
import { Text } from "../Text";
import { DateTime } from "luxon";

export const Calendar = Component({
    render: async () => (
        <Flex direction="column" fullWidth fullHeight>
            <Flex background="brand" grow={false} fullWidth>
                <Text variant="h3">
                    {DateTime.now().toLocaleString(DateTime.DATE_FULL)}
                </Text>
            </Flex>
            <Flex fullWidth fullHeight>
                <Text variant="h4">Events</Text>
            </Flex>
        </Flex>
    )
});
