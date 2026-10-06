// @ts-check
//import { expect } from '@playwright/test';
import { ProjectPage } from './project';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Locator} Locator
 */

/**
 * Playwright Request
 * @typedef {import('@playwright/test').Request} Request
 */

export class FormFilterPage extends ProjectPage {
    // Metadata
    /**
     * The form filter panel
     * @type {Locator}
     */
    formFilterPanel;

    /**
     * The form filter button on menu
     * @type {Locator}
     */
    formFilterSwitcherButton;

    /**
     * The layer selector
     * @type {Locator}
     */
    layerSelector;

    /**
     * The count feature container
     * @type {Locator}
     */
    countFeatureSpan;

    /**
     * The zoom button to zoom on the filtered features on the map
     * @type {Locator}
     */
    zoomButton;

    /**
     * The export button to export the filtered features on the map
     * @type {Locator}
     */
    exportButton;

    /**
     * The unfilter button to unfiltered features on the map
     * @type {Locator}
     */
    unfilterButton;

    /**
     * Constructor for a QGIS project page
     * @param {Page} page The playwright page
     * @param {string} project The project name
     * @param {string} repository The repository name, default to testsrepository
     */
    constructor(page, project, repository = 'testsrepository') {
        super(page, project, repository);

        this.formFilterPanel = page.locator('#filter');
        this.formFilterSwitcherButton = page.locator('#button-filter');
        this.layerSelector = page.locator('#liz-filter-layer-selector');
        this.countFeatureSpan = page.locator('#liz-filter-item-layer-total-count');
        this.zoomButton = page.locator('#liz-filter-zoom');
        this.exportButton = page.locator('#liz-filter-export');
        this.unfilterButton = page.locator('#liz-filter-unfilter');
    }

    /**
     * openFormFilterPanel function
     * opens the form filter dock panel
     */
    async openFormFilterPanel() {
        if (!await this.formFilterPanel.isVisible()) {
            await this.formFilterSwitcherButton.click();
        }
    }

    /**
     * closeFormFilterPanel function
     * closes the form filter dock panel
     */
    async closeFormFilterPanel() {
        if (await this.formFilterPanel.isVisible()) {
            await this.formFilterSwitcherButton.click();
        }
    }

    /**
     * Waits for a GetFeatureCount request
     * @param {undefined|string} layerId Optional layerId to filter on
     * @returns {Promise<Request>} The GetFeature request
     */
    async waitForGetFeatureCountRequest(layerId = undefined) {
        return this.page.waitForRequest(
            request => request.method() === 'GET' &&
            request.url()?.includes('request=getFeatureCount') === true &&
            (layerId === undefined || request.url()?.includes(layerId) === true)
        );
    }

    /**
     * Waits for a GetUniqueValues request
     * @param {string} method GetUniqueValues request HTTP method
     * @param {undefined|string} layerId Optional layerId to filter on
     * @returns {Promise<Request>} The GetFeature request
     */
    async waitForGetUniqueValuesRequest(method = 'GET', layerId = undefined) {
        if (method === 'POST') {
            return this.page.waitForRequest(
                request => request.method() === 'POST' &&
                request.postData()?.includes('request=getUniqueValues') === true &&
                (layerId === undefined || request.postData()?.includes(layerId) === true)
            );
        }
        return this.page.waitForRequest(
            request => request.method() === 'GET' &&
            request.url()?.includes('request=getUniqueValues') === true &&
            (layerId === undefined || request.url()?.includes(layerId) === true)
        );
    }
}
