import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { faker } from "@faker-js/faker";
export const Post = Component({
    render: async () => (
        <div class="post column bg-lighter">
            <div class="row space-between gap border-bottom">
                <img src={faker.image.avatarGitHub()} />
                <h4>{faker.person.fullName()}</h4>
            </div>
            <div class="pad-sm">
                <p>{faker.lorem.paragraph()}</p>
            </div>
        </div>
    )
});
