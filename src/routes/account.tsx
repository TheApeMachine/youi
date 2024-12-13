import { jsx } from "@/lib/vdom";
import { Component } from "@/lib/ui/Component";
import { Form } from "@/lib/ui/form/Form";
import { TextField } from "@/lib/ui/form/TextField";
import { Button } from "@/lib/ui/Button";
import { stateManager } from "@/lib/state";
import { from } from "@/lib/mongo/query";
import { Flex } from "@/lib/ui/Flex";
import { Circle } from "@/lib/ui/Circle";
import { eventBus } from "@/lib/event";

interface AccountData {
    user: any[];
}

export const render = Component({
    loader: () => {
        const authUser = stateManager.getState("authUser");
        return {
            user: from("User").where({ Auth0UserId: authUser.sub }).exec()
        };
    },
    effect: () => {
        eventBus.publish("request-avatar", null);
    },
    render: ({ data }: { data: AccountData }) => {
        const user = data.user[0];

        return (
            <Flex pad="xxl">
                <Flex
                    direction="column"
                    background="bg-glass"
                    className="card-glass"
                    pad="xxl"
                >
                    <div class="avatar-placeholder"></div>

                    <Form>
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
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={user?.Email}
                                required
                                icon="mail"
                            />
                        </div>

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
