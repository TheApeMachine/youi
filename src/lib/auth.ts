/// <reference types="vite/client" />

import auth0, { Auth0Error, Auth0UserProfile } from "auth0-js";
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

// Add after the type definitions, before auth initialization
const handleAuthError = (error: Auth0Error, defaultMessage: string) => {
    const message = error.description ?? defaultMessage;
    eventBus.publish("system", "status", {
        variant: "error",
        title: "Error",
        message
    });
    return new Error(message);
};

// Initialize Auth0 client
export const auth = new auth0.Authentication({
    domain: import.meta.env.VITE_AUTH0_DOMAIN,
    clientID: import.meta.env.VITE_AUTH0_CLIENT_ID,
    responseType: "token",
    scope: "openid profile email"
});

// Auth service
export const AuthService = {
    // Login with username and password
    login: async (username: string, password: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            auth.login({
                realm: "Username-Password-Authentication",
                username,
                password
            }, (error: Auth0Error | null, result?: Token) => {
                if (error) {
                    return reject(handleAuthError(error, "Login failed"));
                }
                if (result) {
                    console.log("login", result);
                    eventBus.publish("state", "stateChange", {
                        key: "auth",
                        value: {
                            ...result,
                            timestamp: Date.now()
                        }
                    });
                }
                resolve();
            });
        });
    },

    // Get user details
    getUserInfo: async (accessToken: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            auth.userInfo(accessToken, (error: Auth0Error | null, result?: Auth0UserProfile) => {
                if (error) {
                    return reject(handleAuthError(error, "Error fetching user info"));
                }

                if (result) {
                    const user = result as User;
                    eventBus.publish("state", "stateChange", {
                        key: "authUser",
                        value: user
                    });
                    resolve(user);
                } else {
                    reject(new Error("No user info returned"));
                }
            });
        });
    },

    isAuthenticated: async (): Promise<boolean> => {
        const auth = await stateManager.get<Token & { timestamp: number }>('auth');
        if (!auth?.accessToken) {
            return false;
        }

        // Check if token is expired
        const expirationTime = auth.expiresIn * 1000; // Convert to milliseconds
        const tokenTimestamp = auth.timestamp || 0;
        const now = Date.now();

        if (now - tokenTimestamp > expirationTime) {
            // Token is expired
            eventBus.publish("state", "stateChange", {
                key: "auth",
                value: null
            });
            return false;
        }

        return true;
    },

    // Logout
    logout: () => {
        eventBus.publish("state", "stateChange", {
            key: "auth",
            value: null
        });
        eventBus.publish("state", "stateChange", {
            key: "authUser",
            value: null
        });

        eventBus.publish("state", "status", {
            variant: "success",
            title: "Logged out",
            message: "You have been logged out successfully"
        });
    }
};