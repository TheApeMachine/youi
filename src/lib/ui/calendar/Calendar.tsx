import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Flex } from "../Flex";
import { Text } from "../Text";
import { DateTime } from "luxon";
import { Icon } from "../icon/Icon";
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

interface LoaderData {
    calendarEvents: CalendarEvent[];
    currentUser: {
        user: User;
        events: CalendarEvent[];
    };
}

export const Calendar = Component({
    loader: () => {
        const user = stateManager.getState("user");
        const now = DateTime.utc();
        const startOfMonth = now.startOf("month").toISO();
        const endOfMonth = now.endOf("month").toISO();

        stateManager.setState({ currentCalendarDate: now });

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
                      .exec(),
            currentUser: Promise.resolve({
                user: user?.[0],
                events: []
            })
        };
    },
    effect: ({ data }: { data: LoaderData }) => {
        if (!data.calendarEvents) return;

        let currentDate =
            stateManager.getState("currentCalendarDate") || DateTime.utc();

        const updateCalendarDisplay = (
            date: DateTime,
            events: CalendarEvent[] = []
        ) => {
            // Update month/year display
            const dateDisplay = document.querySelector(".calendar-date");
            if (dateDisplay) {
                dateDisplay.textContent = date
                    .toLocal()
                    .toLocaleString(DateTime.DATE_FULL);
            }

            // Calculate calendar days
            const daysInMonth = date.daysInMonth ?? 31;
            const firstDayOfMonth = date.startOf("month");
            const startingDayOfWeek = firstDayOfMonth.weekday;
            const daysFromPrevMonth = startingDayOfWeek - 1;
            const prevMonth = date.minus({ months: 1 });
            const daysInPrevMonth = prevMonth.daysInMonth ?? 31;

            const dayElements = document.querySelectorAll(".calendar-day");
            dayElements.forEach((element, index) => {
                const dayNumber = index + 1;
                let displayDay;
                let isCurrentMonth = true;
                let currentDateToCheck;

                if (dayNumber <= daysFromPrevMonth) {
                    // Previous month days
                    displayDay =
                        daysInPrevMonth - (daysFromPrevMonth - dayNumber);
                    isCurrentMonth = false;
                    currentDateToCheck = prevMonth.set({ day: displayDay });
                } else if (dayNumber > daysFromPrevMonth + daysInMonth) {
                    // Next month days
                    displayDay = dayNumber - (daysFromPrevMonth + daysInMonth);
                    isCurrentMonth = false;
                    currentDateToCheck = date
                        .plus({ months: 1 })
                        .set({ day: displayDay });
                } else {
                    // Current month days
                    displayDay = dayNumber - daysFromPrevMonth;
                    currentDateToCheck = date.set({ day: displayDay });
                }

                const dayText = element.querySelector(".day-text");
                if (dayText) {
                    dayText.textContent = displayDay.toString();
                }

                // Find events for this day
                const dayEvents = events.filter((event) => {
                    const eventDate = DateTime.fromISO(event.StartDate).setZone(
                        "utc"
                    );
                    return eventDate.hasSame(currentDateToCheck, "day");
                });

                // Update styling
                (element as HTMLElement).classList.remove("empty-day");
                if (dayEvents.length > 0) {
                    (element as HTMLElement).setAttribute(
                        "data-events",
                        dayEvents.length.toString()
                    );
                    (element as HTMLElement).style.position = "relative";

                    // Add event dots or count
                    const existingIndicator =
                        element.querySelector(".event-indicator");
                    if (existingIndicator) {
                        existingIndicator.textContent =
                            dayEvents.length.toString();
                    } else {
                        const eventIndicator = document.createElement("div");
                        eventIndicator.className = "event-indicator";
                        eventIndicator.textContent =
                            dayEvents.length.toString();
                        (element as HTMLElement).appendChild(eventIndicator);
                    }
                }

                // Update text color and background
                const textElement = element.querySelector(
                    ".day-text"
                ) as HTMLElement;
                if (textElement) {
                    textElement.style.color = isCurrentMonth
                        ? "var(--highlight)"
                        : "var(--muted)";
                }

                // Highlight current day
                const isCurrentDay =
                    isCurrentMonth &&
                    displayDay === date.day &&
                    date.hasSame(DateTime.utc(), "day");
                if (isCurrentDay) {
                    (element as HTMLElement).setAttribute(
                        "background",
                        "brand"
                    );
                } else {
                    (element as HTMLElement).removeAttribute("background");
                }
            });
        };

        // Initial display with loaded events
        updateCalendarDisplay(currentDate, data.currentUser.events);

        // Subscribe to navigation events
        eventBus.subscribe("prev_month", () => {
            currentDate = currentDate.minus({ months: 1 });
            stateManager.setState({ currentCalendarDate: currentDate });
            const startOfMonth = currentDate.startOf("month").toJSDate();
            const endOfMonth = currentDate.endOf("month").toJSDate();

            from("CalendarEvent")
                .where({
                    StartDate: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    },
                    Deleted: null,
                    $or: [
                        {
                            "User.Auth0UserId":
                                data.currentUser.user.Auth0UserId
                        },
                        {
                            "User.Groups._id": {
                                $in: data.currentUser.user.Groups.map(
                                    (g: Group) => g._id
                                )
                            }
                        }
                    ]
                })
                .exec()
                .then((events: CalendarEvent[]) => {
                    updateCalendarDisplay(currentDate, events);
                });
        });

        eventBus.subscribe("next_month", () => {
            currentDate = currentDate.plus({ months: 1 });
            stateManager.setState({ currentCalendarDate: currentDate });
            const startOfMonth = currentDate.startOf("month").toJSDate();
            const endOfMonth = currentDate.endOf("month").toJSDate();

            from("CalendarEvent")
                .where({
                    StartDate: {
                        $gte: startOfMonth,
                        $lte: endOfMonth
                    },
                    Deleted: null,
                    $or: [
                        {
                            "User.Auth0UserId":
                                data.currentUser.user.Auth0UserId
                        },
                        {
                            "User.Groups._id": {
                                $in: data.currentUser.user.Groups.map(
                                    (g: Group) => g._id
                                )
                            }
                        }
                    ]
                })
                .exec()
                .then((events: CalendarEvent[]) => {
                    updateCalendarDisplay(currentDate, events);
                });
        });
    },
    render: async ({ data }: { data: LoaderData }) => {
        const currentDate =
            stateManager.getState("currentCalendarDate") || DateTime.utc();
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
            <Flex direction="column" fullWidth fullHeight>
                <Flex
                    background="brand"
                    radius="top-xs"
                    pad="sm"
                    grow={false}
                    fullWidth
                    justify="space-between"
                >
                    <Button variant="text" trigger="click" event="prev_month">
                        <Icon icon="arrow_left" />
                    </Button>
                    <Text
                        variant="h3"
                        color="highlight"
                        className="calendar-date"
                    >
                        {currentDate
                            .toLocal()
                            .toLocaleString(DateTime.DATE_FULL)}
                    </Text>
                    <Button variant="text" trigger="click" event="next_month">
                        <Icon icon="arrow_right" />
                    </Button>
                </Flex>
                <Flex background="muted" grow={false} fullWidth>
                    <Button variant="icon" trigger="click" event="month_view">
                        <Icon icon="calendar_month" />
                    </Button>
                    <Button variant="icon" trigger="click" event="week_view">
                        <Icon icon="event_note" />
                    </Button>
                    <Button variant="icon" trigger="click" event="day_view">
                        <Icon icon="today" />
                    </Button>
                    <Button variant="text" trigger="click" event="add_event">
                        <Text variant="p">Today</Text>
                    </Button>
                </Flex>
                <Flex
                    direction="column"
                    fullWidth
                    fullHeight
                    pad="md"
                    background="gradient-dark-vertical"
                >
                    <Flex fullWidth grow={false}>
                        {weekdays.map((day) => (
                            <Flex justify="center" pad="sm">
                                <Text variant="p">{day}</Text>
                            </Flex>
                        ))}
                    </Flex>
                    <Flex direction="column" fullWidth fullHeight>
                        {Array.from({ length: 6 }, (_, weekIndex) => (
                            <Flex fullWidth grow>
                                {Array.from({ length: 7 }, (_, dayIndex) => {
                                    const dayNumber =
                                        weekIndex * 7 + dayIndex + 1;
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
                                        displayDay =
                                            dayNumber - daysFromPrevMonth;
                                    }

                                    const isCurrentDay =
                                        displayDay === currentDate.day &&
                                        isCurrentMonth;

                                    return (
                                        <Flex
                                            className="calendar-day"
                                            justify="center"
                                            align="center"
                                            pad="sm"
                                            radius="xs"
                                            background={
                                                isCurrentDay
                                                    ? "brand"
                                                    : undefined
                                            }
                                        >
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
