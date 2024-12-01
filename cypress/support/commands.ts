/// <reference types="cypress" />

export {};

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      mountComponent(component: any): Chainable<void>;
    }
  }
}

Cypress.Commands.add('mountComponent', (component: any) => {
  cy.window().then((win) => {
    const container = win.document.createElement('div');
    win.document.body.appendChild(container);
    // Use jsx function directly
    if (typeof win.jsx === 'function') {
      win.jsx(component, null, container);
    } else {
      throw new Error('JSX function not available');
    }
  });
});