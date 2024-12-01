import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { stateManager } from "@/lib/state";
import { AuthService } from "@/lib/auth";
import { Button } from "../button/Button";

export const Header = Component({
    render: async () => {
        const user = stateManager.getState("authUser");
        const isAuthenticated = await AuthService.isAuthenticated();

        if (!isAuthenticated) {
            return <header class="row shrink pad-sm"></header>;
        }

        return (
            <header class="row space-between pad bg-dark shadow-page topbar">
                <div class="row start">
                    <Button variant="animoji" icon="rocket" className="icon xl" />
                </div>
                <div class="row end gap">
                    {user?.picture ? (
                        <img
                            src={user.picture}
                            alt="avatar"
                            class="ring-purple"
                            data-trigger="click"
                            data-event="menu"
                            data-effect="submenu"
                        />
                    ) : (
                        <span class="material-icons">person</span>
                    )}
                    <Button variant="icon" icon="notifications" />
                </div>
            </header>
        );
    }
});
