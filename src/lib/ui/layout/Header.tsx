import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { stateManager } from "@/lib/state";
import { AuthService } from "@/lib/auth";
import { Button } from "../button/Button";
import { Avatar } from "../profile/Avatar";
import { DynamicIsland } from "../DynamicIsland";

export const Header = Component({
    render: async () => {
        const isAuthenticated = await AuthService.isAuthenticated();

        if (!isAuthenticated) {
            return <header class="row shrink pad-sm"></header>;
        }

        return (
            <header class="column center bg">
                <div class="row start">
                    <Button
                        variant="animoji"
                        icon="rocket"
                        className="icon xl"
                    />
                </div>
                <div class="row end gap">
                    <DynamicIsland
                        header={
                            <Button
                                variant="icon"
                                icon="search"
                                trigger="click"
                                event="search"
                            />
                        }
                    />

                    <Avatar />
                    <Button variant="icon" icon="notifications" />
                </div>
                <span class="material-symbols-rounded fg">arrow_drop_down</span>
            </header>
        );
    }
});
