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
 * The lizmap event object to dispatch to listeners
 *
 * @typedef {object} EventToDispatch
 * @property {string} type - Event type, the event name to listen to, example : "edition.layer.modified"
 */

/**
 * The lizmap event object dispatched to listeners
 *
 * @typedef {EventToDispatch} EventDispatched
 * @property {string}          type        - Event type, the event name to listen to, example : "edition.layer.modified"
 * @property {string}          __eventid__ - Immutable event unique id (used to avoid infinite loop when event is
 *                                           propagated to other dispatchers)
 * @property {EventDispatcher} target      - Immutable event first dispatcher (used to identify the event source when
 *                                           event is propagated to other dispatchers)
 */

/**
 * The lizmap event listener callback
 *
 * @callback EventListener
 * @param {EventDispatched} event - The event object dispatched to listeners
 */

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
        /**
         * Object for keep track of emitted events per events.
         * Keys are the events type, values are the last emitted object (or parameter)
         * for the given event
         * @type {Object}
         *
         */
        this._emittedEventsType = {};
    }

    /**
     * add a listener that will be called for one or several given events
     * @param {EventListener}        listener        - Callback
     * @param {Array<string>|string} supportedEvents - events on which the listener will be called. if undefined or "*",
     *                                                 it will be called for any events
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
     * @param {EventListener}        listenerToRemove - Callback
     * @param {Array<string>|string} supportedEvents  - list of events from which the listener will be removed. if
     *                                                  undefined or "*", it will be removed from any events
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
     * @param {EventToDispatch|string} event - an event name, or an object with a 'type' property having the event name.
     *                                         In this case other properties are parameters for listeners.
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
                    // keep track of the last emitted event
                    this._emittedEventsType[event.type] = event;
                    listener(event);
                }
            });
        } else {
            // there are no listeners for the give event. We keep track of the event
            // for future subscribers
            this._emittedEventsType[event.type] = event;
        }
        if ('*' in this._listeners) {
            this._listeners['*'].forEach((item) => {
                const [listener, ] = item;
                // keep track of the last emitted event
                this._emittedEventsType[event.type] = event;
                listener(event);
            });
        }
    }

    /**
     * Subscribe to events.
     * This method is very similar to addListener, but it can also notify listeners even
     * if they were defined after the event was emitted. It always emits the last event
     * registered for the specific event type.
     * Does not supports wildcard events
     * @param {EventListener}        listener   - Callback
     * @param {Array<string>|string} events     - events on which the listener will be called. if undefined or "*",
     *                                                 it will be called for any events
     */
    subscribe(listener, events) {
        if (events === undefined) {
            throw Error('Notification for all events is not allowed');
        }

        if('string' == typeof events) events = [events];
        else if (Array.isArray(events)) events = [...events];

        events.forEach((ev)=>{
            if(this._emittedEventsType[ev]) {
                // if the event has already been emitted, the listener is called immediately,
                // passing the last emitted object as a parameter
                listener(this._emittedEventsType[ev]);
            }

            // add listener for each event
            this.addListener(listener, ev);
        })
    }
}
