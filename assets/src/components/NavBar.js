/**
 * @module components/NavBar.js
 * @name NavBar
 * @copyright 2023 3Liz
 * @author BOISTEAULT Nicolas
 * @license MPL-2.0
 */

import { mainLizmap, mainEventDispatcher } from '../modules/Globals.js';
import { html, render } from 'lit-html';

import { ZoomSlider } from 'ol/control.js';

/**
 * @class
 * @name NavBar
 * @augments HTMLElement
 */
export default class NavBar extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Display
        const mainTemplate = () => html`
            <button class="btn pan ${mainLizmap.map.isDragZoomActive ? '' : 'active'}" title="${lizDict['navbar.pan.hover']}" @click=${ () => mainLizmap.map.deactivateDragZoom()}></button>
            <button class="btn zoom ${mainLizmap.map.isDragZoomActive ? 'active' : ''}" title="${lizDict['navbar.zoom.hover']}" @click=${ () => mainLizmap.map.activateDragZoom()}></button>
            <button class="btn zoom-extent" title="${lizDict['navbar.zoomextent.hover']}" @click=${ () => mainLizmap.state.map.zoomToInitialExtent()}></button>
            <button class="btn zoom-in" title="${lizDict['navbar.zoomin.hover']}" ?disabled=${mainLizmap.state.map.zoom === mainLizmap.state.map.maxZoom} @click=${ () => mainLizmap.state.map.zoomIn()}></button>
            <div class="slider" title="${lizDict['navbar.slider.hover']}"></div>
            <button class="btn zoom-out" title="${lizDict['navbar.zoomout.hover']}" ?disabled=${mainLizmap.state.map.zoom === mainLizmap.state.map.minZoom} @click=${ () => mainLizmap.state.map.zoomOut()}></button>
        `;

        render(mainTemplate(), this);

        const zoomslider = new ZoomSlider({
            target: document.querySelector('lizmap-navbar .slider')
        });
        mainLizmap.map.addControl(zoomslider);

        mainLizmap.state.map.addListener(
            evt => {
                if (evt.hasOwnProperty('zoom')) {
                    render(mainTemplate(), this);
                }
            },
            ['map.state.changed']
        );

        mainEventDispatcher.addListener(
            () => {
                render(mainTemplate(), this);
            },
            [
                'dragZoom.activated',
                'dragZoom.deactivated'
            ]
        );
    }

    disconnectedCallback() {
    }
}
