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
import { Flex } from "@/lib/ui/Flex";
import { Circle } from "@/lib/ui/Circle";

export const render = Component({
    loader: () => {
        const authUser = stateManager.getState("authUser");
        return {
            user: from("User").where({ Auth0UserId: authUser.sub }).exec()
        };
    },
    render: ({ data }) => {
        const user = data.user[0];

        return (
            <Flex>
                <Flex
                    direction="column"
                    background="bg-glass"
                    className="card-glass"
                >
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
                </Flex>
                <Flex direction="column">
                    <h1>Account Groups</h1>
                    <Circle />
                </Flex>
            </Flex>
        );
    }
});
