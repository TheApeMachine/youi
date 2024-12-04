import './test/setup';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { eventBus, EventManager, type EventManagerType } from './event';

describe('EventBus', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore - accessing private property for tests
        eventBus.listeners = {};
    });

    it('should subscribe and publish events', () => {
        const callback = vi.fn();
        eventBus.subscribe('test', callback);

        const payload = { data: 'test' };
        eventBus.publish('test', payload);

        expect(callback).toHaveBeenCalledWith(payload);
    });

    it('should handle multiple subscribers', () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();

        eventBus.subscribe('test', callback1);
        eventBus.subscribe('test', callback2);

        eventBus.publish('test', { data: 'test' });

        expect(callback1).toHaveBeenCalled();
        expect(callback2).toHaveBeenCalled();
    });

    it('should unsubscribe correctly', () => {
        const callback = vi.fn();
        eventBus.subscribe('test', callback);
        eventBus.unsubscribe('test', callback);

        eventBus.publish('test', { data: 'test' });

        expect(callback).not.toHaveBeenCalled();
    });

    it('should handle conditional subscriptions', () => {
        const callback = vi.fn();
        const condition = (payload: any) => payload.value > 10;

        eventBus.subscribe('test', callback, condition);

        eventBus.publish('test', { value: 5 });
        expect(callback).not.toHaveBeenCalled();

        eventBus.publish('test', { value: 15 });
        expect(callback).toHaveBeenCalled();
    });

    it('should warn when publishing to no listeners', () => {
        const consoleSpy = vi.spyOn(console, 'warn');
        eventBus.publish('nonexistent', {});
        expect(consoleSpy).toHaveBeenCalledWith('No listeners for event: nonexistent');
    });
});

describe('EventManager', () => {
    let eventManager: EventManagerType;
    let mockElement: HTMLElement;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        eventManager = EventManager() as EventManagerType;
        mockElement = document.createElement('div');
        eventManager.init();
        // @ts-ignore - accessing private property for tests
        eventBus.listeners = {};
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Event Handling', () => {
        it('should handle click events with data attributes', () => {
            const publishSpy = vi.spyOn(eventBus, 'publish');
            mockElement.dataset.event = 'testEvent';
            mockElement.dataset.effect = 'testEffect';

            const event = new MouseEvent('click');
            Object.defineProperty(event, 'target', { value: mockElement });

            eventManager.handlers.click(event);

            expect(publishSpy).toHaveBeenCalledWith('testEvent', expect.objectContaining({
                effect: 'testEffect',
                originalEvent: event
            }));
        });

        it('should handle mousemove events', () => {
            const publishSpy = vi.spyOn(eventBus, 'publish');
            const event = new MouseEvent('mousemove');

            eventManager.handlers.mousemove(event);

            expect(publishSpy).toHaveBeenCalledWith('mousemove', expect.objectContaining({
                originalEvent: event
            }));
        });

        it('should handle navigation clicks', () => {
            const publishSpy = vi.spyOn(eventBus, 'publish');
            const link = document.createElement('a');
            link.href = window.location.origin + '/test';

            const event = new MouseEvent('click');
            Object.defineProperty(event, 'target', { value: link });

            eventManager.handlers.click(event);

            expect(publishSpy).toHaveBeenCalledWith('navigate', expect.objectContaining({
                url: '/test'
            }));
        });
    });

    describe('Lifecycle Management', () => {
        it('should handle component mounting', async () => {
            const mountCallback = vi.fn();
            const unmountCallback = vi.fn();

            document.body.appendChild(mockElement);

            eventManager.manageComponentLifecycle(
                mockElement,
                mountCallback,
                unmountCallback
            );

            await vi.runAllTimersAsync();

            expect(mountCallback).toHaveBeenCalled();
        });

        it('should handle component unmounting', async () => {
            const mountCallback = vi.fn();
            const unmountCallback = vi.fn();
            const scopedListeners = {
                click: vi.fn()
            };

            document.body.appendChild(mockElement);

            eventManager.manageComponentLifecycle(
                mockElement,
                mountCallback,
                unmountCallback,
                scopedListeners
            );

            document.body.removeChild(mockElement);

            await vi.runAllTimersAsync();

            expect(unmountCallback).toHaveBeenCalled();
        });
    });

    describe('Event Registration', () => {
        it('should add and remove events', () => {
            const handler = vi.fn();
            const addSpy = vi.spyOn(document, 'addEventListener');
            const removeSpy = vi.spyOn(document, 'removeEventListener');

            eventManager.addEvent('custom', handler);
            expect(addSpy).toHaveBeenCalledWith('custom', handler);

            eventManager.removeEvent('custom');
            expect(removeSpy).toHaveBeenCalledWith('custom', handler);
        });

        it('should add scoped event listeners', () => {
            const handler = vi.fn();
            const addSpy = vi.spyOn(mockElement, 'addEventListener');

            eventManager.addScopedEventListener(mockElement, 'custom', handler);
            expect(addSpy).toHaveBeenCalledWith('custom', handler);
        });
    });

    describe('Initialization', () => {
        it('should initialize with default events', () => {
            const addSpy = vi.spyOn(document, 'addEventListener');

            eventManager.init();

            expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(addSpy).toHaveBeenCalledWith('wheel', expect.any(Function));
            expect(addSpy).toHaveBeenCalledWith('drag', expect.any(Function));
            expect(addSpy).toHaveBeenCalledWith('mousemove', expect.any(Function));
        });
    });
}); 