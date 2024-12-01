import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";

interface Group {
    GroupName: string;
    ImageURL?: string;
    JoinDate: string;
    HasChat: boolean;
    IsPrivate: boolean;
    IsAccountGroup: boolean;
    IsGeneratedGroup: boolean;
    Roles?: number[];
}

interface GroupsProps {
    user: {
        Groups?: Group[];
    };
}

export const Groups = Component<GroupsProps>({
    effect: () => {
        const toggleCollapse = (element: HTMLElement) => {
            const content = element.nextElementSibling as HTMLElement | null;
            const icon = element.querySelector(
                ".material-icons"
            ) as HTMLElement | null;

            if (!content) return;

            if (content.style.maxHeight) {
                content.style.maxHeight = "";
                if (icon) {
                    icon.style.transform = "rotate(0deg)";
                }
            } else {
                content.style.maxHeight = `${content.scrollHeight}px`;
                if (icon) {
                    icon.style.transform = "rotate(180deg)";
                }
            }
        };

        document
            .querySelectorAll('[data-action="toggle"]')
            .forEach((toggle) => {
                toggle.addEventListener("click", (e) => {
                    const target = e.currentTarget as HTMLElement;
                    toggleCollapse(target);
                });
            });
    },
    render: async ({ user }: GroupsProps) => {
        const groups = user?.Groups || [];

        const renderGroup = (group: Group) => (
            <div class="column bg-darker radius-xs">
                <div
                    class="row space-between pad-sm hover pointer"
                    data-action="toggle"
                >
                    <div class="row gap-sm grow">
                        {group.ImageURL ? (
                            <img
                                src={group.ImageURL}
                                alt={group.GroupName}
                                class="xs"
                            />
                        ) : (
                            <span class="material-icons">group</span>
                        )}
                        <div class="column grow">
                            <h4>{group.GroupName}</h4>
                            <small class="light">
                                {new Date(group.JoinDate).toLocaleDateString()}
                            </small>
                        </div>
                    </div>
                    <div class="row gap-sm">
                        <div class="row gap-xs">
                            {group.HasChat && (
                                <span
                                    class="material-icons light"
                                    title="Has Chat"
                                >
                                    chat
                                </span>
                            )}
                            {group.IsPrivate && (
                                <span
                                    class="material-icons light"
                                    title="Private Group"
                                >
                                    lock
                                </span>
                            )}
                            {group.IsAccountGroup && (
                                <span
                                    class="material-icons light"
                                    title="Account Group"
                                >
                                    business
                                </span>
                            )}
                            {group.IsGeneratedGroup && (
                                <span
                                    class="material-icons light"
                                    title="Auto-Generated"
                                >
                                    auto_fix
                                </span>
                            )}
                        </div>
                        <span class="material-icons light">expand_more</span>
                    </div>
                </div>
                <div
                    class="column"
                    style="max-height: 0; overflow: hidden; transition: var(--transition)"
                >
                    {group.Roles && group.Roles.length > 0 && (
                        <div class="column gap-xs pad-sm border-top">
                            <div class="row gap-xs">
                                <span class="material-icons light">badge</span>
                                <h5>Roles</h5>
                            </div>
                            <div class="row gap-xs start">
                                {group.Roles.map((role: number) => (
                                    <div class="bg-dark radius-xs pad-xs">
                                        <small>{role}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );

        return (
            <div class="column gap bg-darker radius-xs">
                <div
                    class="row space-between pad-sm hover pointer"
                    data-action="toggle"
                >
                    <div class="row gap">
                        <span class="material-icons">group</span>
                        <h4>Groups</h4>
                        <div class="bg-dark radius-xs pad-xs">
                            <small>{groups.length}</small>
                        </div>
                    </div>
                    <span class="material-icons light">expand_more</span>
                </div>

                <div
                    class="column gap-sm pad-sm"
                    style="max-height: 0; overflow: hidden; transition: var(--transition)"
                >
                    {groups.map(renderGroup)}
                </div>
            </div>
        );
    }
});
