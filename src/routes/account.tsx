import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { Form } from "@/lib/ui/form/Form";
import { TextField } from "@/lib/ui/form/TextField";
import { FileField } from "@/lib/ui/form/FileField";
import { Button } from "@/lib/ui/button/Button";
import { stateManager } from "@/lib/state";
import { from } from "@/lib/mongo/query";
import { CollapsibleField } from "@/lib/ui/form/CollapsibleField";
import { Groups } from "@/features/Groups";

export const Account = Component({
    loader: () => {
        const authUser = stateManager.getState("authUser");
        return {
            user: from("User").where({ Auth0UserId: authUser.sub }).exec()
        };
    },
    render: ({ data }) => {
        const user = data.user[0];

        return (
            <div class="row grow page">
                <div class="login-container">
                    <div class="column pad gap radius-xs login-card">
                        <div class="column gap brand">
                            <h1>Account Settings</h1>
                            <p>Update your profile information</p>
                        </div>

                        <div class="column width height scrollable">
                            <Form>
                                <FileField
                                    label="Profile Picture"
                                    name="picture"
                                    accept="image/*"
                                />

                                <div class="row gap">
                                    <TextField
                                        label="First Name"
                                        name="firstName"
                                        value={user?.FirstName}
                                        required
                                        icon="person"
                                    />
                                    <TextField
                                        label="Last Name"
                                        name="lastName"
                                        value={user?.LastName}
                                        required
                                        icon="person"
                                    />
                                </div>

                                <TextField
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={user?.Email}
                                    required
                                    icon="mail"
                                />

                                <Groups user={user} />
                                <Button
                                    variant="brand"
                                    icon="check"
                                    data-trigger="click"
                                    data-event="form"
                                    data-effect="submit"
                                >
                                    <span>save</span>
                                </Button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export const render = Account;
