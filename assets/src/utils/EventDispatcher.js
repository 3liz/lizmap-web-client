/**
 * UI components or any other components can be notified by this object of some
 * application events, in order to update their state or to do something
 *
 * @version 0.1
 * @author Laurent Jouanneau
 * @licence MIT
 * @copyright 3Liz 2019
 */

/**
 * Dispatch some application events to listeners
 */
export default class EventDispatcher {

    constructor () {
        this._listeners = {};
    }

    /**
     * add a listener that will be called for one or several given events
     *
     * @param {Function} listener
     * @param {Array|String|Object} supportedEvents events on which the listener will
     *                       be called. if undefined or "*", it will be called for any events
     */
    addListener (listener, supportedEvents ) {

        if (supportedEvents === undefined) {
            supportedEvents = "*"
        }
        let append = (event) => {
            if ("string" === typeof event) {
                event = {
                    type: event
                };
            }

            if (!(event.type in this._listeners)) {
                this._listeners[event.type] = [];
            }
            this._listeners[event.type].push([listener, event]);
        };

        if (Array.isArray(supportedEvents)) {
            supportedEvents.forEach((event) => {
                if (event === "*") {
                    return;
                }
                append(event);
            });
        }
        else {
            append(supportedEvents);
        }
    }

    /**
     * remove a listener that is associated for one or several given events
     *
     * @param {Function} listener
     * @param {Array|String} supportedEvents list of events from which the listener
     *                       will be removed. if undefined or "*", it will be removed from any events
     */
    removeListener (listener, supportedEvents) {

        if (supportedEvents === undefined) {
            supportedEvents = "*"
        }
        let remove = (event) => {
            if ("string" === typeof event) {
                event = {
                    type: event
                };
            }
            if (event.type in this._listeners) {
                let properties = Object.getOwnPropertyNames(event);
                this._listeners[event.type] = this._listeners[event.type].filter((item) => {
                    let [listener, expectedEvent] = item;
                    let match = true;
                    properties.forEach((propName) => {
                        if (!match || propName == 'type') {
                            return;
                        }
                        if (!(propName in expectedEvent) || event[propName] != expectedEvent[propName]) {
                            match = false;
                        }
                    });
                    return !match; // remove all events that match the given event
                });
            }
        };

        if (Array.isArray(supportedEvents)) {
            supportedEvents.forEach(remove);
        }
        else if (supportedEvents == "*") {
            Object.getOwnPropertyNames(this._listeners).forEach(remove);
        }
        else {
            remove(supportedEvents);
        }
    }

    /**
     * Call listeners associated with the given event
     *
     * @param {Object|String} event  an event name, or an object with a 'type'
     *                               property having the event name. In this
     *                               case other properties are parameters for
     *                               listeners.
     */
    dispatch (event) {
        if ('string' == typeof event ) {
            event = {
                type: event
            };
        }

        if (event.type == "*") {
            throw Error("Notification for all events is not allowed");
        }

        if (event.type in this._listeners) {
            this._listeners[event.type].forEach((item) => {
                let [listener, expectedEvent] = item;
                let match = true;
                Object.getOwnPropertyNames(expectedEvent).forEach((propName) => {
                    if (!match || propName == 'type') {
                        return;
                    }
                    if (!(propName in event) || event[propName] != expectedEvent[propName]) {
                        match = false;
                    }
                });
                if (match) {
                    listener(event);
                }
            });
        }
        if ("*" in this._listeners) {
            this._listeners["*"].forEach((listener) => listener(event));
        }
    }
};

