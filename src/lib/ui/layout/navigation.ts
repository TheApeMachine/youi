export const navigation = [
    {
        href: "/dashboard",
        icon: "dashboard",
        label: "Dashboard"
    },
    {
        href: "/organization",
        icon: "lan",
        label: "Organization"
    },
    {
        href: "/connect",
        icon: "chat",
        label: "Connect"
    },
    {
        href: "/events",
        icon: "calendar_month",
        label: "Events"
    },
    {
        href: "/feedback",
        icon: "communication",
        label: "Feedback"
    },
    {
        href: "/learn",
        icon: "school",
        label: "Learn"
    },
    {
        href: "/admin",
        icon: "settings",
        label: "Admin",
        submenu: [
            {
                href: "/admin/tenants",
                icon: "apartment",
                label: "Tenants"
            },
            {
                href: "/admin/users",
                icon: "people",
                label: "Users"
            },
            {
                href: "/admin/timeline",
                icon: "timeline",
                label: "Timeline"
            },
            {
                href: "/admin/feedback",
                icon: "feedback",
                label: "Feedback"
            }
        ]
    }
]