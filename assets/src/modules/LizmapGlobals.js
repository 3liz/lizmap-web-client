/**
 * Export global objects needed by lizmap components and classes
 */

import EventDispatcher from '../utils/EventDispatcher.js';

const MainEventDispatcher = new EventDispatcher();

export  {
    MainEventDispatcher,
};