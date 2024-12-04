/// <reference types="cypress" />

describe('Login Page', () => {
    beforeEach(() => {
        // Visit using Tauri protocol
        cy.visit('/');

        // Handle uncaught exceptions
        Cypress.on('uncaught:exception', (err) => {
            // Return false to prevent Cypress from failing the test
            return false;
        });
    });

    it('shows the login form', () => {
        // Header should start hidden
        cy.get('form').should('be.visible');
    });

    it('displays validation messages for empty fields', () => {
        cy.get('button[type="submit"]').click();

        cy.get('input[name="email"]')
            .then(($input) => {
                expect(($input[0] as HTMLInputElement).validationMessage).to.eq('Please fill out this field.');
            });

        cy.get('input[name="password"]')
            .then(($input) => {
                expect(($input[0] as HTMLInputElement).validationMessage).to.eq('Please fill out this field.');
            });
    });

    it('shows validation message for invalid email format', () => {
        cy.get('input[name="email"]').type('invalid-email');
        cy.get('input[name="password"]').type('ValidPass123');
        cy.get('button[type="submit"]').click();

        cy.get('input[name="email"]')
            .then(($input) => {
                expect(($input[0] as HTMLInputElement).validationMessage).to.eq('Please include an \'@\' in the email address.');
            });
    });

    it('prevents submission with incorrect password', () => {
        cy.intercept('POST', 'https://fanplayground.eu.auth0.com/oauth/token', {
            statusCode: 403,
            body: { error_description: 'Wrong email or password' },
            headers: {
                'content-type': 'application/json'
            }
        }).as('loginRequest');

        cy.get('input[name="email"]').type('user@example.com');
        cy.get('input[name="password"]').type('WrongPassword');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest').then(() => {
            cy.get('.error-message').should('be.visible')
                .and('contain', 'Wrong email or password');
        });
    });

    it('redirects to dashboard upon successful login', () => {
        cy.intercept('POST', '/api/login', {
            statusCode: 200,
            body: { accessToken: 'fake-jwt-token' },
        }).as('loginRequest');

        cy.intercept('GET', '/api/user', {
            statusCode: 200,
            body: { id: 1, name: 'John Doe', email: 'user@example.com' },
        }).as('getUserInfo');

        cy.get('input[name="email"]').type('user@example.com');
        cy.get('input[name="password"]').type('ValidPass123');
        cy.get('button[type="submit"]').click();

        cy.wait('@loginRequest');
        cy.wait('@getUserInfo');

        cy.url().should('include', '/dashboard');
    });

    it('allows user to sign in with Google', () => {
        cy.get('button[icon="android"]').click();
        // Assuming Google OAuth redirects to a new window
        cy.origin('https://accounts.google.com', () => {
            cy.get('input[type="email"]').type('user@gmail.com');
            cy.get('button[type="button"]').contains('Next').click();
            // Add further steps as needed
        });
        // Verify redirection back to dashboard
        cy.url().should('include', '/dashboard');
    });

    it('navigates to the sign-up page', () => {
        cy.contains("Don't have an account?").within(() => {
            cy.get('a').click();
        });
        cy.url().should('include', '/signup');
    });
}); 