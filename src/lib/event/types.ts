export type DOMEventName =
    | 'click'
    | 'input'
    | 'change'
    | 'submit'
    | 'focus'
    | 'blur'
    | 'mouseenter'
    | 'mouseleave'
    | 'keydown'
    | 'keyup';

export type EventType =
    | 'dom'      // DOM events (click, input, etc.)
    | 'state'    // State changes
    | 'route'    // Navigation/routing events
    | 'system'   // System events (loading, error, etc.)
    | 'custom';  // User-defined events

export type EventHandler<T = any> = (event: T) => void;

// Specific event handler types
export type ClickHandler = EventHandler<MouseEvent>;
export type InputHandler = EventHandler<InputEvent>;
export type ChangeHandler = EventHandler<Event>;
export type SubmitHandler = EventHandler<SubmitEvent>;
export type FocusHandler = EventHandler<FocusEvent>;
export type MouseHandler = EventHandler<MouseEvent>;
export type KeyboardHandler = EventHandler<KeyboardEvent>;

// Base event props interface
export interface BaseEventProps {
    [key: string]: EventHandler | undefined;
}

// Specific event props interface that extends base
export interface ComponentEventProps extends BaseEventProps {
    onClick?: ClickHandler;
    onInput?: InputHandler;
    onChange?: ChangeHandler;
    onSubmit?: SubmitHandler;
    onFocus?: FocusHandler;
    onBlur?: FocusHandler;
    onMouseEnter?: MouseHandler;
    onMouseLeave?: MouseHandler;
    onKeyDown?: KeyboardHandler;
    onKeyUp?: KeyboardHandler;
}

export interface EventPayload {
    type: EventType;
    topic?: string;
    effect?: string;
    trigger?: string;
    data?: any;
    meta?: {
        timestamp: number;
        source: string;
        target?: string;
        path?: string[];
        originalEvent?: Event;
    };
}

export interface EventSubscription {
    id: string;
    type: EventType;
    topic?: string;
    pattern?: string;
    callback: (payload: EventPayload) => void;
}

export interface EventMessage {
    type: 'subscribe' | 'unsubscribe' | 'publish' | 'ready';
    payload: EventPayload | EventSubscription;
    id?: string;
}

export interface EventResponse {
    type: string;
    payload: {
        success?: boolean;
        error?: string;
        data?: any;
    };
    id?: string;
}

export interface EventConfig {
    bufferSize?: number;
    debounceMs?: number;
    retainedEvents?: string[];
    patterns?: {
        [key: string]: {
            target: EventType;
            transform?: (payload: EventPayload) => EventPayload;
        }
    };
} 