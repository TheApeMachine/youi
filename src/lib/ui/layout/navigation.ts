export const navigation = [
    {
        href: "/dashboard",
        icon: "dashboard",
        label: "Dashboard"
    },
    {
        href: "/orgchart",
        icon: "lan",
        label: "Orgchart"
    },
    {
        href: "/chat",
        icon: "chat",
        label: "Chat"
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