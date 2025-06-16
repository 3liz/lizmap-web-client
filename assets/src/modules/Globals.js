/**
 * Export global objects needed by lizmap components and classes
 * Internal use only
 */

import Lizmap from './Lizmap.js';
import EventDispatcher from '../utils/EventDispatcher.js';

const mainEventDispatcher = new EventDispatcher();
const mainLizmap = new Lizmap(mainEventDispatcher);

export {
    mainLizmap,
    mainEventDispatcher
};
