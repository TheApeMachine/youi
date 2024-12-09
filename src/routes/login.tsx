import { jsx } from "@/lib/template";
import { AuthService } from "@/lib/auth";
import { Center, Column, Row } from "@/lib/ui/Flex";
import Form from "@/lib/ui/form/Form";
import Button from "@/lib/ui/button/Button";
import { Text } from "@/lib/ui/Text";
import Card from "@/lib/ui/card/Card";
import { eventManager } from "@/lib/event";
import { routerManager } from "@/lib/router/manager";

export default async () => {
    // Check if already authenticated
    const isAuthenticated = await AuthService.isAuthenticated();
    if (isAuthenticated) {
        routerManager.navigate('/');
        return null;
    }

    const handleSubmit = async (values: Record<string, any>) => {
        try {
            await AuthService.login(values.email, values.password);
            
            await eventManager.publish('auth', 'login.success', {
                email: values.email
            });

            // Use router for navigation
            routerManager.navigate('/');
        } catch (error) {
            await eventManager.publish('auth', 'login.error', {
                error: String(error)
            });
        }
    };

    const handleSocialLogin = async (provider: string) => {
        await eventManager.publish('auth', 'social.login', { provider });
    };

    return (
        <Row grow>
            <Center pad="xxl" grow>
                <Card>
                    <Text variant="h1" color="brand">
                        Fan App
                    </Text>
                    <p>Sign in to continue</p>

                    <Form
                        onSubmit={handleSubmit}
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
                                onClick={() => handleSocialLogin('android')}
                            />
                            <Button
                                variant="icon"
                                color="muted"
                                icon="code"
                                onClick={() => handleSocialLogin('github')}
                            />
                            <Button
                                variant="icon"
                                color="muted"
                                icon="flutter_dash"
                                onClick={() => handleSocialLogin('google')}
                            />
                        </Row>
                    </Column>

                    <Column>
                        <p>
                            Don't have an account? <a onClick={() => routerManager.navigate('/signup')}>Sign up</a>
                        </p>
                    </Column>
                </Card>
            </Center>
            <Center className="random-image" grow>
                <img src="/public/logo.png" alt="logo" class="logo" />
            </Center>
        </Row>
    );
};
