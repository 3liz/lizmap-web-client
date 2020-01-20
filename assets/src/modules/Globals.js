/**
 * Export global objects needed by lizmap components and classes
 * Internal use only
 */

import Lizmap from './Lizmap.js';
import EventDispatcher from '../utils/EventDispatcher.js';

const mainLizmap = new Lizmap();
const mainEventDispatcher = new EventDispatcher();

export {
    mainLizmap,
    mainEventDispatcher
};
