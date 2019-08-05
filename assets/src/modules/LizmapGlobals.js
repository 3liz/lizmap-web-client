/**
 * Export global objects needed by lizmap components and classes
 * Internal use only
 */

import EventDispatcher from '../utils/EventDispatcher.js';
import LizmapMapManager from './LizmapMapManager';

const MainEventDispatcher = new EventDispatcher();

export  {
    MainEventDispatcher,
    LizmapMapManager
};
