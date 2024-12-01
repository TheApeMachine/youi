/// <reference types="cypress" />

// Import using relative path instead of alias
import { jsx } from "../../src/lib/template";

// Declare global namespace for our custom implementations
declare global {
  namespace Cypress {
    interface Window {
      jsx: typeof jsx;
      AuthService: any;
      stateManager: any;
      Reveal: any;
    }
  }
}

// Make JSX available globally
Cypress.on('window:before:load', (win) => {
  win.jsx = jsx;
});

export {}; 