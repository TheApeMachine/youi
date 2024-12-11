import { jsx } from "@/lib/template";
import Calendar from "@/lib/ui/calendar/Calendar";
import { stateManager } from "@/lib/state";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import Actions from "@/routes/dashboard/Actions";
import Profile from "@/routes/dashboard/Profile";
import { from } from "@/lib/mongo/query";
import { Grid, GridItem } from "@/lib/ui/grid/Grid";
import Chart from "@/lib/ui/charts/Chart";
import { Text } from "@/lib/ui/Text";

gsap.registerPlugin(Flip);

export default async () => {
    const user = (await stateManager.get("authUser")) as any;
    const dbUser = await from("User")
        .where({ Auth0UserId: user?.sub })
        .limit(1)
        .exec();

    console.log(dbUser);

    return (
        <Grid className="dashboard-grid" gap="xl">
            <GridItem area="actions" order={{ sm: 2 }}>
                <Actions />
            </GridItem>
            <GridItem area="profile" order={{ sm: 1 }}>
                <Profile user={dbUser} />
            </GridItem>
            <GridItem area="calendar">
                <Calendar />
            </GridItem>
            <GridItem area="metrics" direction="column">
                <Text variant="h3" color="text-muted">
                    Task Distribution
                </Text>
                <Chart
                    id="metrics-chart"
                    config={{
                        title: { text: "Task Distribution" },
                        tooltip: { trigger: "item" },
                        legend: { position: "bottom" },
                        theme: {
                            colors: ["#999cff", "#99ff9c", "#ff9999", "#fcff99"]
                        },
                        datasets: [
                            {
                                dimensions: ["status", "value"],
                                source: [
                                    { status: "Completed", value: 40 },
                                    { status: "In Progress", value: 30 },
                                    { status: "Pending", value: 20 },
                                    { status: "Blocked", value: 10 }
                                ]
                            }
                        ],
                        series: [
                            {
                                type: "pie",
                                datasetIndex: 0,
                                encode: {
                                    itemName: "status",
                                    value: "value"
                                },
                                radius: "70%",
                                style: {
                                    label: {
                                        show: true,
                                        position: "outside",
                                        formatter: "{b}: {d}%",
                                        fontSize: 10,
                                        fontWeight: 500,
                                        color: "#fff"
                                    }
                                }
                            }
                        ]
                    }}
                />
            </GridItem>
            <GridItem area="activity" direction="column">
                <Text variant="h3" color="text-muted">
                    Weekly Activity
                </Text>
                <Chart
                    id="activity-chart"
                    config={{
                        title: { text: "Weekly Activity" },
                        tooltip: { trigger: "axis" },
                        legend: { position: "top" },
                        theme: {
                            backgroundColor: "transparent"
                        },
                        datasets: [
                            {
                                dimensions: ["day", "completed", "new"],
                                source: [
                                    { day: "Mon", completed: 12, new: 5 },
                                    { day: "Tue", completed: 15, new: 8 },
                                    { day: "Wed", completed: 8, new: 3 },
                                    { day: "Thu", completed: 10, new: 7 },
                                    { day: "Fri", completed: 7, new: 9 },
                                    { day: "Sat", completed: 3, new: 2 },
                                    { day: "Sun", completed: 5, new: 4 }
                                ]
                            }
                        ],
                        xAxis: {
                            type: "category",
                            name: "Day",
                            axisLabel: {
                                color: "#fff"
                            }
                        },
                        yAxis: {
                            type: "value",
                            name: "Tasks",
                            axisLabel: {
                                color: "#fff"
                            }
                        },
                        series: [
                            {
                                type: "bar",
                                name: "Completed",
                                datasetIndex: 0,
                                encode: {
                                    x: "day",
                                    y: "completed"
                                },
                                style: {
                                    color: "#999cff",
                                    label: {
                                        show: false
                                    }
                                }
                            },
                            {
                                type: "bar",
                                name: "New",
                                datasetIndex: 0,
                                encode: {
                                    x: "day",
                                    y: "new"
                                },
                                style: {
                                    color: "#99ff9c",
                                    label: {
                                        show: false
                                    }
                                }
                            }
                        ]
                    }}
                />
            </GridItem>
        </Grid>
    );
};
