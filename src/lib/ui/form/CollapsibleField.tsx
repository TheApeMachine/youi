import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface CollapsibleFieldProps {
    label: string;
    items: any[];
    renderItem: (item: any) => string | JSX.Element;
    icon?: string;
}

export const CollapsibleField = Component<CollapsibleFieldProps>({
    effect: () => {
        const toggles = document.querySelectorAll('[data-toggle="collapse"]');
        toggles.forEach((toggle) => {
            toggle.addEventListener("click", (e) => {
                const target = e.currentTarget as HTMLElement;
                const content = target.nextElementSibling as HTMLElement;
                const icon = target.querySelector(".material-icons");

                if (content.style.maxHeight) {
                    content.style.maxHeight = "";
                    icon?.textContent && (icon.textContent = "expand_more");
                } else {
                    content.style.maxHeight = content.scrollHeight + "px";
                    icon?.textContent && (icon.textContent = "expand_less");
                }
            });
        });
    },
    render: ({ label, items, renderItem, icon = "folder" }) => (
        <div class="field-group">
            <div
                class="row space-between pad-sm radius-xs bg-dark hover"
                data-toggle="collapse"
            >
                <div class="row gap">
                    <span class="material-icons">{icon}</span>
                    <h4>{label}</h4>
                    <span class="badge">{items.length}</span>
                </div>
                <span class="material-icons">expand_more</span>
            </div>
            <div class="collapsible-content">
                <div class="pad">{items.map((item) => renderItem(item))}</div>
            </div>
        </div>
    )
});
