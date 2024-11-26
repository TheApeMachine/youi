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
export const auth = new auth0.Authentication({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientID: import.meta.env.VITE_AUTH0_CLIENT_ID,
});

// Auth service
export const AuthService = {
    // Login with username and password
    login: async (username: string, password: string): Promise<Token> => {
        return new Promise((resolve, reject) => {
            auth.login({
                realm: "Username-Password-Authentication",
                username,
                password,
            }, (error: Auth0Error | null, result: Token) => {
                if (error) {
                    eventBus.publish("auth:error", error);
                    return reject(error);
                }
                
                // Store token in state
                stateManager.setState({ token: result });
                eventBus.publish("auth:login", result);
                resolve(result);
            });
        });
    },

    // Get user details
    getUserInfo: async (accessToken: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            auth.userInfo(accessToken, (error, result) => {
                if (error) {
                    eventBus.publish("auth:error", error);
                    return reject(error);
                }
                
                // Store user in state
                stateManager.setState({ user: result });
                eventBus.publish("auth:user", result);
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
        stateManager.setState({ token: null, user: null });
        eventBus.publish("auth:logout", null);
    }
}; 