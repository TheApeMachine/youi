import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { faker } from "@faker-js/faker";

export const Profile = Component({
    render: async () => (
        <div class="row shrink pad-sm">
            <div class="row start gap">
                <div class="row left avatar-container">
                    <img alt="avatar" src={faker.image.avatar()} />
                    <div class="status online"></div>
                </div>
                <h4 class="lighter left">{faker.person.fullName()}</h4>
            </div>
        </div>
    )
});
