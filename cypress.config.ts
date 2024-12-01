import { defineConfig } from "cypress";
import { resolve } from 'path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:1420',
    supportFile: "cypress/support/e2e.ts",
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: false,
    async setupNodeEvents(on, config) {
      const tsNode = await import('ts-node');
      
      tsNode.register({
        transpileOnly: true,
        compilerOptions: {
          module: 'ESNext',
          moduleResolution: 'node',
          baseUrl: '.',
          paths: {
            "@/*": ["src/*"]
          }
        }
      });
      
      return config;
    }
  }
});
