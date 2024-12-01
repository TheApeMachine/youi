/// <reference types="cypress" />

describe('Layout and Header Integration', () => {
    beforeEach(() => {
        // Intercept auth endpoints
        cy.intercept('**/api/auth/status', { isAuthenticated: true }).as('authCheck');
        cy.intercept('**/api/user/profile', {
            picture: 'https://example.com/avatar.jpg',
            name: 'Test User'
        }).as('userProfile');

        // Visit using Tauri protocol
        cy.visit('/');
        
        // Wait for auth checks to complete
        cy.wait(['@authCheck', '@userProfile']);
    });

    it('shows and hides header on mouse movement', () => {
        // Header should start hidden
        cy.get('header').should('have.css', 'margin-top', '-100px');

        // Move mouse to top of screen
        cy.get('header').trigger('mousemove', { clientY: 50 });
        
        // Header should be visible
        cy.get('header').should('have.css', 'margin-top', '0px');

        // Move mouse away
        cy.get('main').trigger('mousemove', { clientY: 200 });
        
        // Header should hide again
        cy.get('header').should('have.css', 'margin-top', '-100px');
    });

    it('opens navigation menu when clicking menu icon', () => {
        cy.get('.animoji').click();
        cy.get('.dialog').should('be.visible');
        
        // Check all main navigation items
        cy.get('a[href="/dashboard"]').should('be.visible');
        cy.get('a[href="/orgchart"]').should('be.visible');
        cy.get('a[href="/chat"]').should('be.visible');
        cy.get('a[href="/admin"]').should('be.visible');
    });

    it('handles admin submenu navigation', () => {
        cy.get('.animoji').click();
        
        // Open admin submenu
        cy.get('a[href="/admin"]').click();
        
        // Check submenu items
        cy.get('a[href="/admin/tenants"]').should('be.visible');
        cy.get('a[href="/admin/users"]').should('be.visible');
        cy.get('a[href="/admin/timeline"]').should('be.visible');
        cy.get('a[href="/admin/feedback"]').should('be.visible');
    });

    it('handles slide transitions and updates URL', () => {
        // Wait for Reveal.js to initialize
        cy.window().then((win) => {
            // Trigger a slide change
            win.Reveal.slide(1);
            
            // URL should update based on slide data-path
            cy.url().should('include', '/dashboard');
        });
    });

    it('renders user avatar when available', () => {
        // Stub the state manager to return a user with picture
        cy.window().then((win) => {
            win.stateManager = {
                getState: () => ({
                    picture: 'https://example.com/avatar.jpg'
                })
            };
        });

        cy.get('header img').should('have.attr', 'src', 'https://example.com/avatar.jpg');
        cy.get('header img').should('have.class', 'ring-purple');
    });

    it('shows notifications button', () => {
        cy.get('button').find('.material-icons').contains('notifications').should('be.visible');
    });
}); 