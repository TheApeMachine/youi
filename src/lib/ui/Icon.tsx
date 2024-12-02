import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const Icon = Component({
    render: async ({ icon }: { icon: string }) => (
        <span class="material-symbols-rounded icon">{icon}</span>
    )
});
