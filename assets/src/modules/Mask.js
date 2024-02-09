// The MIT License (MIT)
//
// Copyright (c) 2019-2022 Camptocamp SA
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
// the Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
// FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
// COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
// IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
// CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import Layer from 'ol/layer/Layer.js';
import {createCanvasContext2D} from 'ol/dom.js';
import {toRadians} from 'ol/math.js';
import {FrameState} from 'ol/Map'

/**
 * @augments Layer
 */
export default class Mask extends Layer {
    constructor(options = {}) {
        super(options);

        /**
         * @private
         */
        this.context_ = createCanvasContext2D();

        this.context_.canvas.style.opacity = '0.5';
        this.context_.canvas.style.position = 'absolute';

        /**
         * Provide scale (number) from FrameState
         * @function
         */
        this.getScale;

        /**
         * Provide the size of type import('ol/size').Size
         * @function
         */
        this.getSize;

        /**
         * Provide the rotation
         * @type {undefined|Function}
         */
        this.getRotation;
    }

    /**
     * Render function. Takes the frame state as input and is expected to return an HTML element. Will overwrite the default rendering for the layer.
     * @param {FrameState} frameState Frame state
     * @returns {HTMLElement} The rendered element
     */
    render(frameState) {

        const INCHES_PER_METER = 39.37;
        const DOTS_PER_INCH = 72;

        const cwidth = frameState.size[0];
        this.context_.canvas.width = cwidth;
        const cheight = frameState.size[1];
        this.context_.canvas.height = cheight;
        const center = [cwidth / 2, cheight / 2];

        // background (clockwise)
        this.context_.beginPath();
        this.context_.moveTo(-1, -1);
        this.context_.lineTo(cwidth+1, -1);
        this.context_.lineTo(cwidth+1, cheight+1);
        this.context_.lineTo(-1, cheight+1);
        this.context_.lineTo(-1, -1);
        this.context_.closePath();

        const size = this.getSize();
        const height = size[1];
        const width = size[0];
        const scale = this.getScale(frameState);
        const resolution = frameState.viewState.resolution;

        const extentHalfWidth = ((width / DOTS_PER_INCH / INCHES_PER_METER) * scale) / resolution / 2;
        const extentHalfHeight = ((height / DOTS_PER_INCH / INCHES_PER_METER) * scale) / resolution / 2;

        const rotation = this.getRotation !== undefined ? toRadians(this.getRotation()) : 0;

        // diagonal = distance p1 to center.
        const diagonal = Math.sqrt(Math.pow(extentHalfWidth, 2) + Math.pow(extentHalfHeight, 2));
        // gamma = angle between horizontal and diagonal (with rotation).
        const gamma = Math.atan(extentHalfHeight / extentHalfWidth) - rotation;
        // omega = angle between diagonal and vertical (with rotation).
        // NOT USED const omega = Math.atan(extentHalfWidth / extentHalfHeight) - rotation;
        // Calculation of up left corner.
        const x1 = Math.round(center[0] - Math.cos(gamma) * diagonal);
        const y1 = Math.round(center[1] + Math.sin(gamma) * diagonal);
        // Calculation of down right corner
        const x2 = Math.round(center[0] + Math.cos(gamma) * diagonal);
        const y2 = Math.round(center[1] - Math.sin(gamma) * diagonal);

        // hole (counter-clockwise)
        this.context_.moveTo(x1, y1);
        this.context_.lineTo(x2, y1);
        this.context_.lineTo(x2, y2);
        this.context_.lineTo(x1, y2);
        this.context_.lineTo(x1, y1);
        this.context_.closePath();

        this.context_.fillStyle = '#000';
        this.context_.fill();

        return this.context_.canvas;
    }
}
