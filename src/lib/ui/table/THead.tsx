import { eventBus } from "@/lib/event";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { stats } from "./stats";

export const THead = Component({
    effect: () => {
        const { createMiniChart } = stats();
        const toggleColumn = (header: string) => {
            const columnCells = document.querySelectorAll(
                `[data-column="${header}"]`
            );
            const icon = document.querySelector(`[data-fold-icon="${header}"]`);
            const th = document.querySelector(`th[data-column="${header}"]`);

            const isFolded = th?.classList.contains("folded");

            columnCells.forEach((cell) => {
                if (isFolded) {
                    cell.classList.remove("folded");
                    if (icon) icon.textContent = "unfold_less";
                } else {
                    cell.classList.add("folded");
                    if (icon) icon.textContent = "unfold_more";
                }
            });

            // Also toggle the header itself
            if (th) {
                if (isFolded) {
                    th.classList.remove("folded");
                } else {
                    th.classList.add("folded");
                }
            }
        };

        const toggleSort = (key: string, header: string) => {
            const th = document.querySelector(`th[data-column="${header}"]`);
            const currentSort = th?.getAttribute("data-sort") ?? "none";

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
                let iconName = "sort";
                if (newSort === "asc") iconName = "arrow_upward";
                else if (newSort === "desc") iconName = "arrow_downward";
                sortIcon.textContent = iconName;
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
            if (!payload.value || payload.value.length === 0) return;

            const thead = document.querySelector("thead");
            if (!thead) return;

            const headers = payload.columns;

            thead.innerHTML = "";
            const tr = jsx("tr", {}, "");

            headers.forEach((header: string) => {
                const th = jsx(
                    "th",
                    {
                        "data-column": header,
                        "data-sort": "none",
                        class: "folded"
                    },
                    [
                        jsx("div", { class: "header-content folded" }, [
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
                                    "unfold_more"
                                ),
                                jsx(
                                    "div",
                                    {
                                        class: "header-text",
                                        onclick: () =>
                                            toggleSort(payload.key, header)
                                    },
                                    [header]
                                ),
                                jsx(
                                    "span",
                                    {
                                        class: "material-icons sort-icon"
                                    },
                                    "sort"
                                )
                            ]),
                            jsx("div", {
                                class: "mini-chart",
                                id: `chart-${header}`,
                                style: "width: 100%; height: 50px;"
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
                headers.forEach((header: string) => {
                    createMiniChart(header, payload.value);
                });
            });
        });
    },
    render: () => {
        return <thead></thead>;
    }
});
