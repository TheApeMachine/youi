export const Notification = (message = "New Notification", icon = "📬") => {
    const classes = ["notification"];

    const header = () => {
        return "";
    };

    const aside = () => {
        const iconEl = document.createElement("div");
        iconEl.className = "notification-icon";
        iconEl.textContent = icon;
        return iconEl;
    };

    const main = () => {
        const messageEl = document.createElement("div");
        messageEl.className = "notification-message";
        messageEl.textContent = message;
        return messageEl;
    };

    const article = () => {
        return "";
    };

    const footer = () => {
        return "";
    };

    return {
        classes,
        header,
        aside,
        main,
        article,
        footer
    }
}

export default Notification; 