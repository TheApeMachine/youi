import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Layout } from '../Layout';
import { render } from '@testing-library/dom';

// Mock dependencies
vi.mock('@/lib/template', () => ({
    jsx: vi.fn((type, props, ...children) => ({
        type,
        props,
        children
    }))
}));

vi.mock('reveal.js', () => ({
    default: {
        initialize: vi.fn().mockResolvedValue({
            on: vi.fn()
        })
    }
}));

vi.mock('gsap', () => ({
    default: {
        registerPlugin: vi.fn(),
        timeline: vi.fn(),
        set: vi.fn(),
        to: vi.fn()
    }
}));

describe('Layout Component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();
    });

    it('renders all required child components', async () => {
        const container = document.createElement('div');
        const component = await Layout.render({});
        container.appendChild(component);

        expect(container.querySelector('header')).toBeTruthy();
        expect(container.querySelector('main')).toBeTruthy();
        expect(container.querySelector('footer')).toBeTruthy();
        expect(container.querySelector('.reveal')).toBeTruthy();
    });

    it('initializes Reveal.js in the effect', () => {
        Layout.effect();
        const Reveal = require('reveal.js').default;
        
        expect(Reveal.initialize).toHaveBeenCalledWith({
            hash: false,
            respondToHashChanges: false,
            history: false,
            transition: 'convex',
            loop: false,
            keyboard: false,
            embedded: true,
            disableLayout: true,
            display: 'flex'
        });
    });

    it('contains all navigation items', async () => {
        const container = document.createElement('div');
        const component = await Layout.render({});
        container.appendChild(component);

        const expectedRoutes = ['/dashboard', '/orgchart', '/chat', '/admin'];
        expectedRoutes.forEach(route => {
            const link = container.querySelector(`[href="${route}"]`);
            expect(link).toBeTruthy();
        });
    });
}); 