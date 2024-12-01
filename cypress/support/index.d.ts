/// <reference types="cypress" />

declare namespace Cypress {
    interface AUTWindow {
        AuthService: {
            isAuthenticated: () => Promise<boolean>;
        };
        stateManager: {
            getState: (key?: string) => any;
        };
        Reveal: any;
    }
}

export {}; 