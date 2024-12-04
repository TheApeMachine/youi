import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Flex } from "../Flex";
import { Text } from "../Text";
import { DateTime } from "luxon";
import { Icon } from "../Icon";
import { Button } from "../button/Button";
import { eventBus } from "@/lib/event";
import { from } from "@/lib/mongo/query";
import { stateManager } from "@/lib/state";

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

export const Calendar = Component({
    loader: () => {
        const user = stateManager.getState("user");
        const now = DateTime.utc();
        const startOfMonth = now.startOf('month').toISO();
        const endOfMonth = now.endOf('month').toISO();

        // Always return an object with promises, even when user is not present
        return {
            calendarEvents: !user?.[0]
                ? Promise.resolve([])
                : from("CalendarEvent")
                    .where({
                        StartDate: {
                            $gte: startOfMonth,
                            $lte: endOfMonth
                        },
                        Deleted: null
                    })
                    .exec()
        };
    },
    effect: ({ data }) => {
        if (!data.calendarEvents) return;

        let currentDate = DateTime.utc();

        const updateCalendarDisplay = (date: DateTime, events: CalendarEvent[] = []) => {
            // Update month/year display
            const dateDisplay = document.querySelector('.calendar-date');
            if (dateDisplay) {
                dateDisplay.textContent = date.toLocal().toLocaleString(DateTime.DATE_FULL);
            }

            // Update days
            const daysInMonth = date.daysInMonth ?? 31;
            const firstDayOfMonth = date.startOf('month');
            const startingDayOfWeek = firstDayOfMonth.weekday;

            const dayElements = document.querySelectorAll('.calendar-day');
            dayElements.forEach((element, index) => {
                const dayNumber = Math.floor(index / 7) * 7 + (index % 7) - (startingDayOfWeek - 2);
                const dayText = element.querySelector('.day-text');

                // Find events for this day
                const currentDate = date.set({ day: Math.max(1, dayNumber) });
                const dayEvents = events.filter(event => {
                    const eventDate = DateTime.fromISO(event.StartDate).setZone('utc');
                    return eventDate.hasSame(currentDate, 'day');
                });

                if (dayNumber > 0 && dayNumber <= daysInMonth) {
                    if (dayText) {
                        dayText.textContent = dayNumber.toString();
                    }
                    (element as HTMLElement).classList.remove('empty-day');

                    // Add event indicators if there are events
                    if (dayEvents.length > 0) {
                        (element as HTMLElement).setAttribute('data-events', dayEvents.length.toString());
                        (element as HTMLElement).style.position = 'relative';
                        // Add event dots or count
                        const eventIndicator = document.createElement('div');
                        eventIndicator.className = 'event-indicator';
                        eventIndicator.textContent = dayEvents.length.toString();
                        (element as HTMLElement).appendChild(eventIndicator);
                    }

                    // Highlight current day if it's today
                    if (dayNumber === date.day && date.hasSame(DateTime.utc(), 'day')) {
                        (element as HTMLElement).setAttribute('background', 'brand');
                    } else {
                        (element as HTMLElement).removeAttribute('background');
                    }
                } else {
                    if (dayText) {
                        dayText.textContent = '';
                    }
                    (element as HTMLElement).classList.add('empty-day');
                    (element as HTMLElement).removeAttribute('background');
                }
            });
        };

        // Initial display with loaded events
        updateCalendarDisplay(currentDate, data.currentUser.events);

        // Subscribe to navigation events
        eventBus.subscribe("prev_month", () => {
            currentDate = currentDate.minus({ months: 1 });
            const startOfMonth = currentDate.startOf('month').toJSDate();
            const endOfMonth = currentDate.endOf('month').toJSDate();

            from("CalendarEvent")
                .where({
                    StartDate: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    },
                    Deleted: null,
                    $or: [
                        { "User.Auth0UserId": data.currentUser.user.Auth0UserId },
                        { "User.Groups._id": { $in: data.currentUser.user.Groups.map((g: Group) => g._id) } }
                    ]
                })
                .exec()
                .then((events: CalendarEvent[]) => {
                    updateCalendarDisplay(currentDate, events);
                });
        });

        eventBus.subscribe("next_month", () => {
            currentDate = currentDate.plus({ months: 1 });
            const startOfMonth = currentDate.startOf('month').toJSDate();
            const endOfMonth = currentDate.endOf('month').toJSDate();

            from("CalendarEvent")
                .where({
                    StartDate: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    },
                    Deleted: null,
                    $or: [
                        { "User.Auth0UserId": data.currentUser.user.Auth0UserId },
                        { "User.Groups._id": { $in: data.currentUser.user.Groups.map((g: Group) => g._id) } }
                    ]
                })
                .exec()
                .then((events: CalendarEvent[]) => {
                    updateCalendarDisplay(currentDate, events);
                });
        });
    },
    render: async ({ data }) => {
        const now = DateTime.utc();
        const daysInMonth = now.daysInMonth ?? 31;
        const firstDayOfMonth = now.startOf('month');
        const startingDayOfWeek = firstDayOfMonth.weekday;

        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return (
            <Flex direction="column" fullWidth fullHeight>
                <Flex background="brand" radius="top-xs" pad="sm" grow={false} fullWidth justify="space-between">
                    <Button
                        variant="text"
                        trigger="click"
                        event="prev_month"
                    >
                        <Icon icon="arrow_left" />
                    </Button>
                    <Text variant="h3" color="highlight" className="calendar-date">
                        {now.toLocal().toLocaleString(DateTime.DATE_FULL)}
                    </Text>
                    <Button
                        variant="text"
                        trigger="click"
                        event="next_month"
                    >
                        <Icon icon="arrow_right" />
                    </Button>
                </Flex>
                <Flex direction="column" fullWidth fullHeight pad="md" background="gradient-dark-vertical">
                    <Flex fullWidth grow={false}>
                        {weekdays.map(day => (
                            <Flex justify="center" pad="sm">
                                <Text variant="p">{day}</Text>
                            </Flex>
                        ))}
                    </Flex>
                    <Flex direction="column" fullWidth fullHeight>
                        {Array.from({ length: Math.ceil((daysInMonth + startingDayOfWeek - 1) / 7) }, (_, weekIndex) => (
                            <Flex fullWidth grow>
                                {Array.from({ length: 7 }, (_, dayIndex) => {
                                    const dayNumber = weekIndex * 7 + dayIndex - (startingDayOfWeek - 2);
                                    const isCurrentDay = dayNumber === now.day;
                                    return (
                                        <Flex
                                            className="calendar-day"
                                            justify="center"
                                            align="center"
                                            pad="sm"
                                            radius="xs"
                                            background={isCurrentDay ? "brand" : undefined}
                                        >
                                            {dayNumber > 0 && dayNumber <= daysInMonth && (
                                                <Text variant="p" color="highlight" className="day-text">
                                                    {dayNumber.toString()}
                                                </Text>
                                            )}
                                        </Flex>
                                    );
                                })}
                            </Flex>
                        ))}
                    </Flex>
                </Flex>
            </Flex>
        );
    }
});
