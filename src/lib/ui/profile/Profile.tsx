import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { faker } from "@faker-js/faker";

export const Profile = Component({
    render: async () => (
        <div class="column pad bg-darker">
            <div class="row gap">
                <img src={faker.image.avatarGitHub()} />
                <h4 class="nobreak">{faker.person.fullName()}</h4>
            </div>
        </div>
    )
});
