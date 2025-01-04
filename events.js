/*
EventManager is a singleton that centralizes event handling and allows
individual elements to subscribe to events.
*/
export const EventManager = () => {
    const events = [];
    const subscriptions = [];

    const subscribe = (id, event, handler) => {
        console.log(id, event, handler);
        subscriptions.push({ id, event, handler });
    };

    const unsubscribe = (id, event, handler) => {
        const index = subscriptions.findIndex(
            subscription => subscription.id === id && subscription.event === event && subscription.handler === handler
        );
        if (index !== -1) {
            subscriptions.splice(index, 1);
        }
    };

    ["click", "select", "change", "mouseenter", "mouseleave"].forEach(event => {
        window.addEventListener(event, (e) => {
            console.log(e);
            const target = e.target;

            if (target) {
                const subscription = subscriptions.find(
                    subscription => subscription.id === target.id && subscription.event === event
                );

                if (subscription) {
                    document.startViewTransition(() => subscription.handler(e));
                }
            }
        });
    });

    return {
        subscribe,
        unsubscribe
    };
};

export default EventManager;