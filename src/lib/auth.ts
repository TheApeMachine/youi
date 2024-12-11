/// <reference types="vite/client" />

import auth0, { Auth0Error, Auth0UserProfile } from "auth0-js";
import { eventManager } from "@/lib/event";
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

const handleAuthError = (error: Auth0Error, defaultMessage: string) => {
    const message = error.description ?? defaultMessage;
    eventManager.publish("system", "status", {
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
    login: async (username: string, password: string): Promise<Token> => {
        return new Promise((resolve, reject) => {
            auth.login({
                realm: "Username-Password-Authentication",
                username,
                password
            }, async (error: Auth0Error | null, result?: Token) => {
                if (error) {
                    return reject(handleAuthError(error, "Login failed"));
                }
                if (result) {
                    // Store the token with timestamp
                    const tokenData = {
                        ...result,
                        timestamp: Date.now()
                    };

                    await stateManager.set('auth', tokenData);

                    // Get and store user info
                    try {
                        const user = await AuthService.getUserInfo(result.accessToken);
                        await stateManager.set('authUser', user);
                        resolve(result);
                    } catch (error) {
                        reject(new Error(error instanceof Error ? error.message : "Unknown error"));
                    }
                } else {
                    reject(new Error("No token returned"));
                }
            });
        });
    },

    // Get user details
    getUserInfo: async (accessToken: string): Promise<User> => {
        return new Promise((resolve, reject) => {
            auth.userInfo(accessToken, async (error: Auth0Error | null, result?: Auth0UserProfile) => {
                if (error) {
                    return reject(handleAuthError(error, "Error fetching user info"));
                }

                if (result) {
                    const user = result as User;
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
            // Token is expired, clear auth state
            await AuthService.logout();
            return false;
        }

        return true;
    },

    // Logout
    logout: async () => {
        await stateManager.set('auth', null);
        await stateManager.set('user', null);

        eventManager.publish("system", "status", {
            variant: "success",
            title: "Logged out",
            message: "You have been logged out successfully"
        });
    }
};