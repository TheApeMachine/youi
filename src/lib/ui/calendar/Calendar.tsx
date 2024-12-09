import { jsx } from "@/lib/template";
import { Column, Flex, Row } from "../Flex";
import { Text } from "../Text";
import { DateTime } from "luxon";
import Icon from "../icon/Icon";
import Button from "../button/Button";
import { eventBus } from "@/lib/event";
import { from } from "@/lib/mongo/query";
import { stateManager } from "@/lib/state";
import { List } from "../List";

interface Group {
    _id: string;
    GroupName: string;
}

interface User {
    _id: string;
    Auth0UserId: string;
    Groups: Group[];
}

interface CalendarEvent {
    _id: string;
    StartDate: string;
    EndDate: string;
    Name: string;
    Description: string;
    Location: string;
    Groups: string[];
    Presence: Array<{ UserId: string; Present: boolean }>;
}

interface LoaderData {
    calendarEvents: CalendarEvent[];
    currentUser: {
        user: User;
        events: CalendarEvent[];
    };
}

const query = (startOfMonth: string | null, endOfMonth: string | null) =>
    from("CalendarEvent")
        .where({
            StartDate: { $gte: startOfMonth, $lte: endOfMonth },
            Deleted: null
        })
        .exec();

export default async () => {
    const currentDate: DateTime =
        (await stateManager.get("currentCalendarDate")) ?? DateTime.utc();

    const daysInMonth = currentDate.daysInMonth ?? 31;
    const firstDayOfMonth = currentDate.startOf("month");
    const startingDayOfWeek = firstDayOfMonth.weekday;

    // Calculate days from previous month
    const daysFromPrevMonth = startingDayOfWeek - 1;
    const prevMonth = currentDate.minus({ months: 1 });
    const daysInPrevMonth = prevMonth.daysInMonth ?? 31;

    // Calculate days needed from next month
    const totalDaysShown = 42; // 6 rows * 7 days
    const daysFromNextMonth =
        totalDaysShown - (daysFromPrevMonth + daysInMonth);

    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <Column background="bg-gradient-vertical" radius grow gap>
            <Row justify="space-between">
                <Button variant="text">
                    <Icon icon="arrow_left" />
                </Button>
                <Text variant="h3" color="highlight" className="calendar-date">
                    {currentDate.toLocal().toLocaleString(DateTime.DATE_FULL)}
                </Text>
                <Button variant="text">
                    <Icon icon="arrow_right" />
                </Button>
            </Row>
            <Row justify="center" gap>
                <Button variant="icon">
                    <Icon icon="calendar_month" />
                </Button>
                <Button variant="icon">
                    <Icon icon="calendar_month" />
                </Button>
                <Button variant="icon">
                    <Icon icon="event_note" />
                </Button>
                <Button variant="icon">
                    <Icon icon="today" />
                </Button>
                <Button variant="text">
                    <Text variant="p">Today</Text>
                </Button>
            </Row>
            <Column>
                <Row justify="center" gap>
                    {weekdays.map((day) => (
                        <Row>
                            <Text variant="p">{day}</Text>
                        </Row>
                    ))}
                </Row>
                <Column justify="space-evenly" gap grow>
                    {Array.from({ length: 6 }, (_, weekIndex) => (
                        <Row justify="space-evenly" gap grow>
                            {Array.from({ length: 7 }, (_, dayIndex) => {
                                const dayNumber = weekIndex * 7 + dayIndex + 1;
                                let displayDay;
                                let isCurrentMonth = true;

                                if (dayNumber <= daysFromPrevMonth) {
                                    // Previous month days
                                    displayDay =
                                        daysInPrevMonth -
                                        (daysFromPrevMonth - dayNumber);
                                    isCurrentMonth = false;
                                } else if (
                                    dayNumber >
                                    daysFromPrevMonth + daysInMonth
                                ) {
                                    // Next month days
                                    displayDay =
                                        dayNumber -
                                        (daysFromPrevMonth + daysInMonth);
                                    isCurrentMonth = false;
                                } else {
                                    // Current month days
                                    displayDay = dayNumber - daysFromPrevMonth;
                                }

                                const isCurrentDay =
                                    displayDay === currentDate.day &&
                                    isCurrentMonth;

                                return (
                                    <Text
                                        variant="p"
                                        color={
                                            isCurrentMonth
                                                ? "highlight"
                                                : "muted"
                                        }
                                        className="day-text"
                                    >
                                        {displayDay.toString()}
                                    </Text>
                                );
                            })}
                        </Row>
                    ))}
                </Column>
                <Column>
                    <List
                        zebra
                        items={(
                            await query(
                                currentDate.toISODate(),
                                currentDate.plus({ months: 1 }).toISODate()
                            )
                        ).map((event) => (
                            <Row>
                                <Text variant="p">{event.Name}</Text>
                            </Row>
                        ))}
                    />
                </Column>
            </Column>
        </Column>
    );
};
