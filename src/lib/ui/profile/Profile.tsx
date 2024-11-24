import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { faker } from "@faker-js/faker";

export const Profile = Component({
    render: async () => (
        <div class="row shrink pad-sm">
            <div class="row gap">
                <img alt="avatar" src={faker.image.avatarGitHub()} />
                <div class="status online"></div>
                <h4 class="nobreak">{faker.person.fullName()}</h4>
            </div>
        </div>
    )
});
