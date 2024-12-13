import { jsx } from "@/lib/vdom";
import { User } from "@/types/mongo/User";

const sizeMap = {
    sm: 32,
    md: 64,
    lg: 128
};

export const Avatar = async (props: {
    user: User;
    size: "sm" | "md" | "lg";
}) => {
    return props.user?.ImageURL ? (
        <img
            src={props.user.ImageURL + "&w=" + sizeMap[props.size]}
            alt="avatar"
            class="avatar"
            data-trigger="click"
            data-event="menu"
            data-effect="submenu"
        />
    ) : (
        <span class="material-icons">person</span>
    );
};
