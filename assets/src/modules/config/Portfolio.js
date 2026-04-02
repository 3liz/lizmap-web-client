/**
 * @module config/Portfolio.js
 * @name Portfolio
 * @copyright 2026 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { BaseObjectConfig } from './BaseObject.js';
import { createEnum } from './../utils/Enums.js';
import { ValidationError } from './../Errors.js';

export const FolioZoomMethods = createEnum({
    'FixedScale': 'fixed_scale',
    'BestScale': 'best_scale',
    'Margin': 'margin',
});

const folioRequiredProperties = {
    'layout': {type: 'string'},
    'theme': {type: 'string'},
    'zoom_method': {type: 'string'},
}

const folioOptionalProperties = {
    'fixed_scale': {type: 'number', nullable: true, default: null},
    'margin': {type: 'number', nullable: true, default: null},
}

/**
 * Class representing folio config
 * @class
 * @augments BaseObjectConfig
 */
export class FolioConfig extends BaseObjectConfig {

    /**
     * Create folio config instance
     * @param {object} cfg - the lizmap config object for folio
     */
    constructor(cfg) {
        super(cfg, folioRequiredProperties, folioOptionalProperties);

        // Check zoom_method
        if (this._zoom_method != FolioZoomMethods.FixedScale &&
            this._zoom_method != FolioZoomMethods.BestScale &&
            this._zoom_method != FolioZoomMethods.Margin) {
            throw new ValidationError('The folio zoom method is not valid `' + this._zoom_method + '`!');
        }
        if (this._zoom_method == FolioZoomMethods.FixedScale && this._fixed_scale == null) {
            throw new ValidationError('The folio fixed scale has to be defined for fixed scale zoom method!');
        }
        if (this._zoom_method == FolioZoomMethods.Margin && this._margin == null) {
            throw new ValidationError('The folio margin has to be defined for margin zoom method!');
        }
    }

    /**
     * The layout name
     * @type {string}
     */
    get layout() {
        return this._layout;
    }

    /**
     * The theme name
     * @type {string}
     */
    get theme() {
        return this._theme;
    }

    /**
     * The zoom method
     * @type {string}
     */
    get zoomMethod() {
        return this._zoom_method;
    }

    /**
     * The fixed scale value when the zoom method is fixed scale
     * @type {null|number}
     */
    get fixedScale() {
        return this._fixed_scale;
    }

    /**
     * The margin (%) value when the zoom method is margin
     * @type {null|number}
     */
    get margin() {
        return this._margin;
    }
}

export const PortfolioDrawingGeometries = createEnum({
    'Point': 'point',
    'Line': 'line',
    'Polygon': 'polygon',
});

const portfolioRequiredProperties = {
    'title': {type: 'string'},
    'drawing_geometry': {type: 'string'},
    'folios': {type: 'array'},
}

const portfolioOptionalProperties = {
    'description': {type: 'string', default: ''},
}

/**
 * Class representing a portfolio config
 * @class
 * @augments BaseObjectConfig
 */
export class PortfolioConfig extends BaseObjectConfig {
    /**
     * Create portfolio config instance
     * @param {object} cfg - the lizmap config object for layer
     */
    constructor(cfg) {
        super(cfg, portfolioRequiredProperties, portfolioOptionalProperties)

        // Check geometry type
        if (this._drawing_geometry != PortfolioDrawingGeometries.Point &&
            this._drawing_geometry != PortfolioDrawingGeometries.Line &&
            this._drawing_geometry != PortfolioDrawingGeometries.Polygon) {
            throw new ValidationError('The portfolio drawing geometry is not valid `' + this._drawing_geometry + '`!');
        }
        if (this._folios.length == 0) {
            throw new ValidationError('The portfolio must have at least one folio!');
        }

        this._folios = []
        if (cfg.hasOwnProperty('folios')) {
            for (const folio of cfg['folios']) {
                const newFolio = new FolioConfig(folio)
                if (this._drawing_geometry == PortfolioDrawingGeometries.Point &&
                    newFolio.zoomMethod != FolioZoomMethods.FixedScale) {
                    throw new ValidationError('The portfolio drawing geometry is Point, so the zoom method must be fixed_scale!');
                } else if (this._drawing_geometry != PortfolioDrawingGeometries.Point &&
                    newFolio.zoomMethod == FolioZoomMethods.FixedScale) {
                    throw new ValidationError('The portfolio drawing geometry is not Point, so the zoom method must not be fixed_scale!');
                }
                this._folios.push(newFolio)
            }
        }
    }

    /**
     * The portfolio title
     * @type {string}
     */
    get title() {
        return this._title;
    }

    /**
     * The portfolio drawing geometry type
     * @type {string}
     */
    get drawingGeometry() {
        return this._drawing_geometry;
    }

    /**
     * The portfolio description
     * @type {string}
     */
    get description() {
        return this._description;
    }

    /**
     * The copy of folios
     * @type {FolioConfig[]}
     */
    get folios() {
        return [...this._folios];
    }

    /**
     * Iterate through folios
     * @generator
     * @yields {FolioConfig} The next folio
     */
    *getFolios() {
        for (const folio of this._folios) {
            yield folio;
        }
    }
}

const portfoliosRequiredProperties = {
    'list': {type: 'array'},
}

/**
 * Class representing portfolios config
 * @class
 * @augments BaseObjectConfig
 */
export class PortfoliosConfig extends BaseObjectConfig {

    /**
     * Create postfolios config instance
     * @param {object} cfg - the lizmap config object for portfolios
     */
    constructor(cfg) {
        super(cfg, portfoliosRequiredProperties, {})

        this._list = []
        if (cfg.hasOwnProperty('list')) {
            for (const portfolio of cfg['list']) {
                this._list.push(new PortfolioConfig(portfolio))
            }
        }
    }

    /**
     * The copy of portfolio list
     * @type {PortfolioConfig[]}
     */
    get list() {
        return [...this._list];
    }

    /**
     * Iterate through portfolio list
     * @generator
     * @yields {PortfolioConfig} The next portfolio
     */
    *getList() {
        for (const portfolio of this._list) {
            yield portfolio;
        }
    }
}
