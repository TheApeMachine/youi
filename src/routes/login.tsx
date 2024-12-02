import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { AuthService } from "@/lib/auth";
import { eventBus, EventPayload } from "@/lib/event";
import { createRouter } from "@/lib/router";
import { Flex } from "@/lib/ui/Flex";
import { Form } from "@/lib/ui/form/Form";
import { TextField } from "@/lib/ui/form/TextField";
import { Button } from "@/lib/ui/button/Button";
import { Text } from "@/lib/ui/Text";
export const render = Component({
    effect: () => {
        createRouter().then(({ navigateTo }) => {
            eventBus.subscribe("login", async (payload: EventPayload) => {
                const { email, password } = payload.data as {
                    email: string;
                    password: string;
                };
                await AuthService.login(email, password);
            });

            eventBus.subscribe(
                "stateChange",
                async (payload: { key: string; value: any }) => {
                    if (payload.key === "auth") {
                        await AuthService.getUserInfo(
                            payload.value.accessToken
                        );
                        navigateTo("/dashboard");
                    }
                }
            );
        });
    },
    render: async () => (
        <Flex fullHeight fullWidth>
            <Flex direction="column" grow>
                <Flex direction="column" gap="md" className="card-shadow">
                    <Text variant="h1" color="brand">
                        Fan App
                    </Text>
                    <p>Sign in to continue</p>

                    <Form event="login" effect="authenticate">
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            icon="person"
                            required
                            validationMessage="Please enter a valid email"
                        />
                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            icon="lock"
                            required
                            validationMessage="Password is required"
                        />
                        <Button variant="brand" type="submit" icon="key">
                            <Text variant="h6">Sign in</Text>
                        </Button>
                    </Form>

                    <Flex direction="column" gap="md" fullWidth>
                        <p>Or sign in with</p>
                        <Flex gap="md" fullWidth>
                            <Button
                                variant="icon"
                                color="muted"
                                icon="android"
                            />
                            <Button variant="icon" color="muted" icon="code" />
                            <Button
                                variant="icon"
                                color="muted"
                                icon="flutter_dash"
                            />
                        </Flex>
                    </Flex>

                    <Flex direction="column">
                        <p>
                            Don't have an account? <a href="/signup">Sign up</a>
                        </p>
                    </Flex>
                </Flex>
            </Flex>
            <Flex direction="column" className="random-image" grow>
                <img src="/public/logo.png" alt="logo" class="logo" />
            </Flex>
        </Flex>
    )
});
