export interface EventPayload {
    type: string;
    data: any;
}

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

export interface HandlerPayload {
    eventName: string;
    handlerId: string;
}

export interface EventDispatchPayload {
    eventName: string;
    event: EventPayload;
}

export type EventMessageType =
    | 'subscribe'
    | 'unsubscribe'
    | 'publish'
    | 'event'
    | 'success'
    | 'error'
    | 'ready';

export interface EventMessage {
    type: EventMessageType;
    payload: HandlerPayload | EventDispatchPayload | { success?: boolean; error?: string };
    id?: string;
} 