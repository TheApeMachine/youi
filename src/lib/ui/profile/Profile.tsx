import { jsx } from "@/lib/vdom";

export const Profile = (props: {
    groupUser: { ImageURL: string; FirstName: string };
}) => (
    <li>
        <div class="row left avatar md">
            <img
                alt="avatar"
                class="image"
                src={props.groupUser.ImageURL + "&width=64"}
            />
            <div class="status online"></div>
        </div>
        <span>{props.groupUser.FirstName}</span>
    </li>
);
