import { eventBus } from "@/lib/event";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import * as echarts from "echarts";

const determineColumnType = (columnData: any[]): string => {
    const nonNullData = columnData.filter(
        (value) => value !== null && value !== undefined
    );
    if (nonNullData.every((value) => typeof value === "number"))
        return "number";
    if (nonNullData.every((value) => typeof value === "boolean"))
        return "boolean";
    if (
        nonNullData.every(
            (value) => typeof value === "string" && !isNaN(Date.parse(value))
        )
    )
        return "datetime";
    return "string";
};

const createMiniChart = (header: string, data: any[]) => {
    const chartContainer = document.getElementById(`chart-${header}`);
    if (!chartContainer) return;

    const columnData = data.map((row) => row[header]);
    const columnType = determineColumnType(columnData);

    let chartData;
    switch (columnType) {
        case "number":
            // For numeric data, create a line chart
            chartData = columnData.filter((value) => typeof value === "number");
            break;
        case "string":
            // For string data, create frequency chart
            const frequency: Record<string, number> = {};
            columnData.forEach((value) => {
                if (!frequency[value]) frequency[value] = 0;
                frequency[value]++;
            });
            chartData = Object.values(frequency);
            break;
        default:
            return; // Skip other types for now
    }

    if (chartData.length === 0) return;

    try {
        const myChart = echarts.init(chartContainer);
        const option = {
            tooltip: {
                confine: true,
                textStyle: { fontSize: 10 }
            },
            xAxis: { type: "category", show: false },
            yAxis: { type: "value", show: false },
            series: [
                {
                    type: columnType === "number" ? "line" : "bar",
                    data: chartData,
                    showSymbol: false
                }
            ],
            grid: { left: 0, right: 0, top: 0, bottom: 0 }
        };
        myChart.setOption(option);

        // Handle resize
        window.addEventListener("resize", () => {
            myChart.resize();
        });
    } catch (error) {
        console.error(`Failed to initialize chart: ${error}`);
    }
};

export const THead = Component({
    effect: (props: RenderProps) => {
        const toggleColumn = (header: string) => {
            const columnCells = document.querySelectorAll(
                `[data-column="${header}"]`
            );
            const icon = document.querySelector(`[data-fold-icon="${header}"]`);

            columnCells.forEach((cell) => {
                if (cell.classList.contains("folded")) {
                    cell.classList.remove("folded");
                    if (icon) icon.textContent = "unfold_less";
                } else {
                    cell.classList.add("folded");
                    if (icon) icon.textContent = "unfold_more";
                }
            });
        };

        const toggleSort = (key: string, header: string) => {
            const th = document.querySelector(`th[data-column="${header}"]`);
            const currentSort = th?.getAttribute("data-sort") || "none";

            // Reset all other headers
            document.querySelectorAll("th[data-sort]").forEach((el) => {
                if (el !== th) {
                    el.setAttribute("data-sort", "none");
                    const sortIcon = el.querySelector(".sort-icon");
                    if (sortIcon) sortIcon.textContent = "sort";
                }
            });

            // Toggle sort state
            let newSort: "asc" | "desc" | "none" = "asc";
            if (currentSort === "asc") newSort = "desc";
            if (currentSort === "desc") newSort = "none";

            th?.setAttribute("data-sort", newSort);
            const sortIcon = th?.querySelector(".sort-icon");
            if (sortIcon) {
                sortIcon.textContent =
                    newSort === "asc"
                        ? "arrow_upward"
                        : newSort === "desc"
                        ? "arrow_downward"
                        : "sort";
            }

            // Emit sort event for mongo client
            if (newSort !== "none") {
                eventBus.publish("sortChanged", {
                    collection: key,
                    field: header,
                    order: newSort
                });
            }
        };

        eventBus.subscribe("collectionData", (payload: any) => {
            console.log("collectionData", payload);
            if (!payload.value || payload.value.length === 0) return;

            const thead = document.querySelector("thead");
            if (!thead) return;

            const headers = Object.keys(payload.value[0]);

            thead.innerHTML = "";
            const tr = jsx("tr");

            headers.forEach((header) => {
                const th = jsx(
                    "th",
                    { "data-column": header, "data-sort": "none" },
                    [
                        jsx("div", { class: "header-content" }, [
                            jsx("div", { class: "header-controls" }, [
                                jsx(
                                    "span",
                                    {
                                        class: "material-icons fold-icon",
                                        "data-fold-icon": header,
                                        onclick: (e: Event) => {
                                            e.stopPropagation();
                                            toggleColumn(header);
                                        }
                                    },
                                    "unfold_less"
                                ),
                                jsx(
                                    "div",
                                    {
                                        class: "header-text",
                                        onclick: () =>
                                            toggleSort(payload.key, header)
                                    },
                                    [
                                        header,
                                        jsx(
                                            "span",
                                            {
                                                class: "material-icons sort-icon"
                                            },
                                            "sort"
                                        )
                                    ]
                                )
                            ]),
                            jsx("div", {
                                class: "mini-chart",
                                id: `chart-${header}`,
                                style: "width: 100px; height: 30px;"
                            })
                        ])
                    ]
                );
                tr.appendChild(th);
            });

            const actionTh = jsx("th", { class: "actions" }, [
                jsx("span", { class: "material-symbols-rounded" }, "csv"),
                jsx("span", { class: "material-symbols-rounded" }, "add")
            ]);
            tr.appendChild(actionTh);

            thead.appendChild(tr);

            // Create charts after DOM is updated
            requestAnimationFrame(() => {
                headers.forEach((header) => {
                    createMiniChart(header, payload.value);
                });
            });
        });
    },
    render: (props: RenderProps) => {
        return <thead></thead>;
    }
});
