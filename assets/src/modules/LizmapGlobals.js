/**
 * Export global objects needed by lizmap components and classes
 * Internal use only
 */

import EventDispatcher from '../utils/EventDispatcher.js';
import LizmapMapManager from './LizmapMapManager';

const INCHTOMM = 25.4;
const MainEventDispatcher = new EventDispatcher();

export  {
    INCHTOMM,
    MainEventDispatcher,
    LizmapMapManager
};
