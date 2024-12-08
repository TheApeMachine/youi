import { jsx } from "@/lib/template";
import { AuthService } from "@/lib/auth";
import { Center, Column, Row } from "@/lib/ui/Flex";
import Form from "@/lib/ui/form/Form";
import Button from "@/lib/ui/button/Button";
import { Text } from "@/lib/ui/Text";
import Card from "@/lib/ui/card/Card";

export default async () => {
    return (
        <Row>
            <Center>
                <Card>
                    <Text variant="h1" color="brand">
                        Fan App
                    </Text>
                    <p>Sign in to continue</p>

                    <Form
                        onSubmit={() => {
                            console.log("submit");
                        }}
                        fields={{
                            email: {
                                type: "email",
                                label: "Email",
                                required: true
                            },
                            password: {
                                type: "password",
                                label: "Password",
                                required: true
                            }
                        }}
                        buttons={{
                            submit: (
                                <Button variant="submit" icon="login">
                                    Sign In
                                </Button>
                            )
                        }}
                    />

                    <Column gap>
                        <p>Or sign in with</p>
                        <Row gap>
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
                        </Row>
                    </Column>

                    <Column>
                        <p>
                            Don't have an account? <a href="/signup">Sign up</a>
                        </p>
                    </Column>
                </Card>
            </Center>
            <Column className="random-image" grow>
                <img src="/public/logo.png" alt="logo" class="logo" />
            </Column>
        </Row>
    );
};
