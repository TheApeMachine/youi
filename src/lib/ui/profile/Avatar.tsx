import { stateManager } from "@/lib/state";
import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const Avatar = Component({
    render: async () => {
        const user = stateManager.getState("user")[0];

        return user?.ImageURL ? (
            <img
                src={user.ImageURL + "&w=128"}
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
