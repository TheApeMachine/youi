import { stateManager } from "@/lib/state";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const Avatar = Component({
    render: async () => {
        const authUser = stateManager.getState("authUser");

        return authUser?.picture ? (
            <img
                src={authUser?.picture}
                alt="avatar"
                class="avatar"
                data-trigger="click"
                data-event="menu"
                data-effect="submenu"
            />
        ) : (
            <span class="material-icons">person</span>
        );
    }
});
