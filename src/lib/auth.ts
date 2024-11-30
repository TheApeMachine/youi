import auth0, { Auth0Error } from "auth0-js";
import { eventBus } from "@/lib/event";
import { stateManager } from "@/lib/state";

export type Token = {
    accessToken: string;
    idToken: string;
    scope: string;
    expiresIn: number;
    tokenType: string;
};

export type User = {
    sub: string;
    nickname: string;
    name: string;
    picture: string;
    updated_at: string;
    email?: string;
    email_verified?: boolean;
};

// Initialize Auth0 client
export const auth = new auth0.WebAuth({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientID: import.meta.env.VITE_AUTH0_CLIENT_ID,
    responseType: 'token id_token',
    scope: 'openid profile email',
    redirectUri: window.location.origin
});

// Auth service
export const AuthService = {
    // Login with username and password
    login: async (username: string, password: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            auth.login({
                realm: "Username-Password-Authentication",
                username,
                password,
                responseType: 'token id_token',
            }, (error: Auth0Error | null) => {
                if (error) {
                    eventBus.publish("status", {
                        status: "error",
                        variant: "error",
                        title: "Login failed",
                        message: error.description || "Login failed"
                    });
                    return reject(error);
                }
                resolve();
            });
        });
    },

    // Handle authentication callback
    handleAuthentication: async (): Promise<void> => {
        return new Promise((resolve, reject) => {
            auth.parseHash((error, authResult) => {
                if (error) {
                    eventBus.publish("status", {
                        status: "error",
                        variant: "error",
                        title: "Login failed",
                        message: error.description || "Login failed"
                    });
                    return reject(error);
                }
                if (authResult && authResult.accessToken && authResult.idToken) {
                    const token = {
                        accessToken: authResult.accessToken,
                        idToken: authResult.idToken,
                        scope: authResult.scope || '',
                        expiresIn: authResult.expiresIn || 0,
                        tokenType: authResult.tokenType || 'Bearer'
                    };
                    eventBus.publish("stateChange", {
                        key: "token",
                        value: token
                    });
                    resolve();
                }
            });
        });
    },

    // Get user details
    getUserInfo: async (accessToken: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            auth.client.userInfo(accessToken, (error, result) => {
                if (error) {
                    eventBus.publish("status", {
                        status: "error",
                        variant: "error",
                        title: "Error",
                        message: error.description || "Error fetching user info"
                    });
                    return reject(error);
                }

                // Store user in state
                eventBus.publish("stateChange", {
                    key: "user",
                    value: result
                });
                resolve(result as User);
            });
        });
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = stateManager.getState("token") as Token | null;
        if (!token) return false;

        // Check if token is expired
        const expirationDate = new Date(token.expiresIn * 1000);
        return new Date() < expirationDate;
    },

    // Logout
    logout: () => {
        eventBus.publish("stateChange", {
            key: "token",
            value: null
        });
        eventBus.publish("stateChange", {
            key: "user",
            value: null
        });
        auth.logout({
            returnTo: window.location.origin
        });
    }
}; 