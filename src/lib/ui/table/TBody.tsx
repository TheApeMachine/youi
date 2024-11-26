import { eventBus } from "@/lib/event";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface RenderProps {
    data?: any[];
}

const renderNestedContent = (value: any, level: number = 0): HTMLElement => {
    if (value === null || value === undefined) {
        return jsx("span", { class: "null-value" }, "null");
    }

    if (Array.isArray(value)) {
        const container = jsx("div", { class: "nested-array" }, "");
        const preview = jsx(
            "div",
            { class: "preview-content" },
            `Array(${value.length})${
                value.length > 0 ? ` [${typeof value[0]}]` : ""
            }`
        );
        const content = jsx("div", { class: "nested-content" }, "");

        value.forEach((item, index) => {
            const itemContainer = jsx("div", { class: "array-item" }, "");
            const indexLabel = jsx(
                "span",
                { class: "array-index" },
                `${index}: `
            );
            itemContainer.appendChild(indexLabel);
            itemContainer.appendChild(renderNestedContent(item, level + 1));
            content.appendChild(itemContainer);
        });

        container.appendChild(preview);
        container.appendChild(content);

        // Add expand/collapse functionality
        preview.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            container.classList.toggle("expanded");
        });

        return container;
    }

    if (typeof value === "object") {
        const container = jsx("div", { class: "nested-object" }, "");
        const keys = Object.keys(value);
        const preview = jsx(
            "div",
            { class: "preview-content" },
            `{${keys.length} keys}${
                keys.length > 0
                    ? ` [${keys.slice(0, 2).join(", ")}${
                          keys.length > 2 ? "..." : ""
                      }]`
                    : ""
            }`
        );
        const content = jsx("div", { class: "nested-content" }, "");

        Object.entries(value).forEach(([key, val]) => {
            const row = jsx("div", { class: "object-row" }, "");
            const keyLabel = jsx("span", { class: "object-key" }, `${key}: `);
            row.appendChild(keyLabel);
            row.appendChild(renderNestedContent(val, level + 1));
            content.appendChild(row);
        });

        container.appendChild(preview);
        container.appendChild(content);

        // Add expand/collapse functionality
        preview.addEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            container.classList.toggle("expanded");
        });

        return container;
    }

    // Handle primitive values with more context
    const valueStr = String(value);
    const displayValue =
        typeof value === "string" && valueStr.length > 50
            ? `"${valueStr.substring(0, 47)}..."`
            : typeof value === "string"
            ? `"${valueStr}"`
            : valueStr;

    return jsx(
        "span",
        { class: `primitive-value ${typeof value}` },
        displayValue
    );
};

export const TBody = Component({
    effect: (props: RenderProps) => {
        eventBus.subscribe("collectionData", (payload: any) => {
            const tbody = document.querySelector("tbody");
            if (!tbody) return;

            const validRows = payload.value.filter((row: any) =>
                Object.values(row).some(
                    (value) => value !== null && value !== undefined
                )
            );

            tbody.innerHTML = "";

            for (const row of validRows) {
                const tr = jsx("tr", {}, "");
                for (const key in row) {
                    const td = jsx(
                        "td",
                        {
                            "data-column": key,
                            class: "nested-cell"
                        },
                        ""
                    );
                    td.appendChild(renderNestedContent(row[key]));
                    tr.appendChild(td);
                }
                tbody.appendChild(tr);
            }
        });
    },
    render: (props: RenderProps) => {
        return <tbody></tbody>;
    }
});
