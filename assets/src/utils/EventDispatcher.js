/**
 * UI components or any other components can be notified by this object of some
 * application events, in order to update their state or to do something
 * @version 0.1.0
 * @author Laurent Jouanneau
 * @license MIT
 * @copyright 3Liz 2019
 */

import { hashCode } from './../modules/utils/Converters.js'

/**
 * @class
 * Dispatch some application events to listeners
 * @name EventDispatcher
 */
export default class EventDispatcher {

    constructor() {
        this._listeners = {};
        this._stackEventId = [];
        this._serial = 0;
    }

    /**
     * add a listener that will be called for one or several given events
     * @param {Function} listener - Callback
     * @param {Array | string | object} supportedEvents events on which the listener will
     *                       be called. if undefined or "*", it will be called for any events
     */
    addListener(listener, supportedEvents) {

        if (supportedEvents === undefined) {
            supportedEvents = '*';
        }
        const append = (event) => {
            if ('string' === typeof event) {
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
                if (event === '*') {
                    return;
                }
                append(event);
            });
        } else {
            append(supportedEvents);
        }
    }

    /**
     * remove a listener that is associated for one or several given events
     * @param {Function} listenerToRemove - Callback
     * @param {Array | string} supportedEvents list of events from which the listener
     *                       will be removed. if undefined or "*", it will be removed from any events
     */
    removeListener(listenerToRemove, supportedEvents) {

        if (supportedEvents === undefined) {
            supportedEvents = '*';
        }
        const remove = (event) => {
            if ('string' === typeof event) {
                event = {
                    type: event
                };
            }
            if (event.type in this._listeners) {
                const properties = Object.getOwnPropertyNames(event);
                this._listeners[event.type] = this._listeners[event.type].filter((item) => {
                    const [listener, expectedEvent] = item;
                    let matchEvent = true;
                    // check if the event properties match the event to search
                    properties.forEach((propName) => {
                        if (!matchEvent || propName == 'type') {
                            return;
                        }
                        if (!(propName in expectedEvent) || event[propName] != expectedEvent[propName]) {
                            matchEvent = false;
                        }
                    });

                    if (matchEvent && listener === listenerToRemove) {
                        // we found the listener, let's remove it from the list
                        return false;
                    }

                    return true;
                });
            }
        };

        if (Array.isArray(supportedEvents)) {
            supportedEvents.forEach(remove);
        } else if (supportedEvents == '*') {
            Object.getOwnPropertyNames(this._listeners).forEach(remove);
        } else {
            remove(supportedEvents);
        }
    }

    /**
     * Call listeners associated with the given event
     * @param {object | string} event  an event name, or an object with a 'type'
     *                               property having the event name. In this
     *                               case other properties are parameters for
     *                               listeners.
     */
    dispatch(event) {
        if ('string' == typeof event) {
            event = {
                type: event
            };
        }

        if (event.type == '*') {
            throw Error('Notification for all events is not allowed');
        }

        // Define an __eventid__ property and do not dispatch an already dispatched event
        if (!event.hasOwnProperty('__eventid__')) {
            this._serial += 1;
            // Add the immutable __eventid__ property
            Object.defineProperty(event, "__eventid__", {
                value: hashCode(JSON.stringify(event)) +'-'+ Date.now() +'-'+ this._serial,
                enumerable: false,
                // This could go either way, depending on your
                // interpretation of what an "id" is
                writable: false
            });
            // Add the immutable target property
            Object.defineProperty(event, "target", {
                value: this,
                enumerable: false,
                // This could go either way, depending on your
                // interpretation of what an "id" is
                writable: false
            });
            // Add it to the stack
            this._stackEventId.unshift(event['__eventid__']);
            // Limit the stack to 10 events
            if (this._stackEventId.length > 10) {
                this._stackEventId.pop();
            }
        } else {
            // Get the index in the dispatched event stack
            const eventIdIdx = this._stackEventId.indexOf(event['__eventid__']);
            if ( eventIdIdx == -1) {
                // if the eventid is unknown add it to the stack
                this._stackEventId.unshift(event['__eventid__']);
                // Limit the stack to 10 events
                if (this._stackEventId.length > 10) {
                    this._stackEventId.pop();
                }
            } else {
                // The eventid is already in the stack
                // move it to the top and do not dispatch
                this._stackEventId.slice(eventIdIdx, 1);
                this._stackEventId.unshift(event['__eventid__']);
                return;
            }
        }

        if (event.type in this._listeners) {
            this._listeners[event.type].forEach((item) => {
                const [listener, expectedEvent] = item;
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
        if ('*' in this._listeners) {
            this._listeners['*'].forEach((item) => {
                const [listener, ] = item;
                listener(event);
            });
        }
    }
}
