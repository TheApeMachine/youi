import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

export const Profile = Component({
    render: (props) => (
        <li>
            <div class="row left avatar-container">
                <img
                    alt="avatar"
                    class="ring-darker"
                    src={props.groupUser.ImageURL + "&width=64"}
                />
                <div class="status online"></div>
            </div>
            <span>{props.groupUser.FirstName}</span>
        </li>
    )
});
