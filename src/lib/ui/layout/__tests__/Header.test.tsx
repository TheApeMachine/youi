import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../Header';
import { stateManager } from '@/lib/state';
import { AuthService } from '@/lib/auth';

type HeaderType = {
    (props: any): any;
    effect?: (props: { rootElement: HTMLElement }) => void;
};

const HeaderComponent = {
    ...Header as HeaderType,
    render: Header,
    effect: (props: { rootElement: HTMLElement }) => {
        const h = Header as HeaderType;
        if (h.effect) h.effect(props);
    }
};

// Mock dependencies
vi.mock('@/lib/template', () => ({
    jsx: vi.fn((type, props, ...children) => ({
        type,
        props,
        children
    }))
}));

vi.mock('@/lib/state', () => ({
    stateManager: {
        getState: vi.fn()
    }
}));

vi.mock('@/lib/auth', () => ({
    AuthService: {
        isAuthenticated: vi.fn()
    }
}));

vi.mock('gsap', () => ({
    default: {
        timeline: vi.fn(() => ({
            to: vi.fn(),
            progress: vi.fn().mockReturnValue(1),
            reverse: vi.fn()
        })),
        set: vi.fn()
    }
}));

describe('Header Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset DOM
        document.body.innerHTML = '';
    });

    it('renders minimal header when user is not authenticated', async () => {
        vi.mocked(AuthService.isAuthenticated).mockResolvedValue(false);
        
        const component = await HeaderComponent.render({});
        const container = document.createElement('div');
        container.appendChild(component);

        const header = container.querySelector('header');
        expect(header?.classList.contains('row')).toBe(true);
        expect(header?.classList.contains('shrink')).toBe(true);
        expect(header?.classList.contains('pad-sm')).toBe(true);
        expect(container.querySelector('.animoji')).toBeFalsy();
    });

    it('renders full header with user avatar when authenticated with picture', async () => {
        vi.mocked(AuthService.isAuthenticated).mockResolvedValue(true);
        vi.mocked(stateManager.getState).mockReturnValue({
            picture: 'https://example.com/avatar.jpg'
        });

        const component = await HeaderComponent.render({});
        const container = document.createElement('div');
        container.appendChild(component);

        const header = container.querySelector('header');
        expect(header?.classList.contains('row')).toBe(true);
        expect(header?.classList.contains('space-between')).toBe(true);
        expect(header?.classList.contains('pad')).toBe(true);
        expect(header?.classList.contains('bg-dark')).toBe(true);
        expect(container.querySelector('img[src="https://example.com/avatar.jpg"]')).toBeTruthy();
        expect(container.querySelector('.animoji')).toBeTruthy();
    });

    it('renders person icon when authenticated user has no picture', async () => {
        vi.mocked(AuthService.isAuthenticated).mockResolvedValue(true);
        vi.mocked(stateManager.getState).mockReturnValue({});

        const component = await HeaderComponent.render({});
        const container = document.createElement('div');
        container.appendChild(component);

        expect(container.querySelector('.material-icons')).toBeTruthy();
        expect(container.querySelector('img')).toBeFalsy();
    });

    it('sets up mouse move event listener in effect', () => {
        const mockRootElement = document.createElement('div');
        const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

        HeaderComponent.effect({ rootElement: mockRootElement });

        expect(addEventListenerSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
    });
}); 