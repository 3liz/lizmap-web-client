/**
 * @module state/Portfolios.js
 * @name PortfoliosState
 * @copyright 2026 3Liz
 * @author DHONT René-Luc
 * @license MPL-2.0
 */

import { createEnum } from './../utils/Enums.js';
import EventDispatcher from './../../utils/EventDispatcher.js';
import { PortfoliosConfig, PortfolioConfig } from '../config/Portfolio.js'

/**
 * @import { EventDispatched } from './../../utils/EventDispatcher.js'
 */

/**
 * Enum for portfolios UI status.
 * @readonly
 * @enum {string}
 */
export const PortfoliosUiStatuses = createEnum({
    'Hidden': 'hidden',
    'Visible': 'visible',
});

/**
 * Enum for portfolio geometry status.
 * @readonly
 * @enum {string}
 */
export const PortfolioGeometryStatuses = createEnum({
    'None': 'none', /** The geometry has not been drawn yet */
    'Drawn': 'drawn', /** The geometry has been drawn */
});

/**
 * Enum for portfolio run status.
 * @readonly
 * @enum {string}
 */
export const PortfolioRunStatuses = createEnum({
    'Wait': 'wait', /** Wait for a selected portfolio an a drawn geometry */
    'Ready': 'ready', /** Ready to run */
    'Running': 'running', /** Running */
});

/**
 * Portfolios UI status changed
 * @event PortfoliosUiStatusChanged
 * @type {EventDispatched}
 * @property {string} type   - portfolios.ui.status.changed
 * @property {string} status - hidden / visible
 */

/**
 * Portfolios portfolio selected
 * @event PortfoliosPortfolioSelected
 * @type {EventDispatched}
 * @property {string}          type      - portfolios.portfolio.selected
 * @property {number}          index     - portfolio index
 * @property {PortfolioConfig} portfolio - portfolio
 */


/**
 * Class representing the lizmap Map State
 * @class
 * @augments EventDispatcher
 */
export class PortfoliosState extends EventDispatcher {

    /**
     * Create a lizmap Portfolios State instance
     * @param {PortfoliosConfig} config - main config
     */
    constructor(config) {
        super();
        this._config = config;

        // properties
        this._uiStatus = PortfoliosUiStatuses.Hidden;
        this._selected = null;
        this._geometryStatus = PortfolioGeometryStatuses.None;
        this._runStatus = PortfolioRunStatuses.Wait;
    }

    /**
     * The ui status
     * @type {string}
     */
    get uiStatus() {
        return this._uiStatus;
    }

    /**
     * The selected portfolio
     * @type {null|PortfolioConfig}
     */
    get selected() {
        return this._selected;
    }

    /**
     * The geometry status
     * @type {string}
     */
    get geometryStatus() {
        return this._geometryStatus;
    }

    /**
     * The run status
     * @type {string}
     */
    get runStatus() {
        return this._runStatus;
    }

    /**
     * Display portfolios selector
     * @fires PortfoliosUiStatusChanged
     */
    display() {
        this._uiStatus = PortfoliosUiStatuses.Visible;
        this.dispatch({
            type: 'portfolios.ui.status.changed',
            status: this._uiStatus,
        });
    }

    /**
     * Hide portfolios selector
     * @fires PortfoliosUiStatusChanged
     */
    hide() {
        this._uiStatus = PortfoliosUiStatuses.Hidden;
        this.dispatch({
            type: 'portfolios.ui.status.changed',
            status: this._uiStatus,
        });
    }

    /**
     * Select a portfolio
     * @param {number} index The portfolio index, negative to unselect
     * @fires PortfoliosPortfolioSelected
     * @throws {RangeError} if the index is out of range
     */
    select(index) {
        const oldValue = this._selected;
        if (index < 0) {
            this._selected = null;
            index = -1;
        } else {
            if (index >= this._config.list.length) {
                throw new RangeError('Portfolio index must be less than the number of portfolios');
            }
            this._selected = this._config.list[index];
        }
        if (oldValue != this._selected) {
            this._geometryStatus = PortfolioGeometryStatuses.None;
            this._runStatus = PortfolioRunStatuses.Wait;
            this.dispatch({
                type: 'portfolios.portfolio.selected',
                index: index,
                portfolio: this._selected,
            });
        }
    }

    /**
     * The geometry is drawn
     */
    geometryDrawn() {
        if (this._selected == null) {
            throw new Error('No portfolio selected yet!');
        }
        this._geometryStatus = PortfolioGeometryStatuses.Drawn;
        this._runStatus = PortfolioRunStatuses.Ready;
        this.dispatch({
            type: 'portfolios.run.status.changed',
            status: this._runStatus,
        });
    }

    /**
     * The geometry is cleared
     */
    geometryCleared() {
        if (this._selected == null) {
            throw new Error('No portfolio selected yet!');
        }
        this._geometryStatus = PortfolioGeometryStatuses.None;
        this._runStatus = PortfolioRunStatuses.Wait;
        this.dispatch({
            type: 'portfolios.run.status.changed',
            status: this._runStatus,
        });
    }

    /**
     * Run portfolio
     */
    launch() {
        if (this._runStatus == PortfolioRunStatuses.Wait) {
            throw new Error('The portfolio is not ready yet!');
        }
        if (this._runStatus == PortfolioRunStatuses.Running) {
            throw new Error('The portfolio is already running!');
        }
        this._runStatus = PortfolioRunStatuses.Running;
        this.dispatch({
            type: 'portfolios.run.status.changed',
            status: this._runStatus,
        });
        this.dispatch({
            type: 'portfolios.portfolio.launched',
            portfolio: this._selected,
        });
    }
}
