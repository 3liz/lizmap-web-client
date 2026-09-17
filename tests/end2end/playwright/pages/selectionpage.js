// @ts-check
import { ProjectPage } from './project';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Locator} Locator
 */

export class SelectionPage extends ProjectPage {
    // Metadata
    /**
     * The print panel
     * @type {Locator}
     */
    selectionPanel;

    /**
     * The print button on menu
     * @type {Locator}
     */
    selectionSwitcherButton;

    /**
     * Constructor for a QGIS project page
     * @param {Page} page The playwright page
     * @param {string} project The project name
     * @param {string} repository The repository name, default to testsrepository
     */
    constructor(page, project, repository = 'testsrepository') {
        super(page, project, repository);

        this.selectionPanel = page.locator('#selectiontool');
        this.selectionSwitcherButton = page.locator('#button-selectiontool');
    }

    /**
     * Opens the selection panel
     */
    async openSelectionPanel() {
        if (!await this.selectionPanel.isVisible()) {
            await this.selectionSwitcherButton.click();
        }
    }

    /**
     * Opens the draw panel
     */
    async closeSelectionPanel() {
        if (await this.selectionPanel.isVisible()) {
            await this.selectionSwitcherButton.click();
        }
    }

    /**
     * Gets the refresh button
     * @returns {Locator} The refresh button locator
     */
    getRefreshButton() {
        return this.selectionPanel.locator('.selectiontool-type-refresh');
    }

    /**
     * Gets the plus button
     * @returns {Locator} The plus button locator
     */
    getPlusButton() {
        return this.selectionPanel.locator('.selectiontool-type-plus');
    }

    /**
     * Gets the minus button
     * @returns {Locator} The minus button locator
     */
    getMinusButton() {
        return this.selectionPanel.locator('.selectiontool-type-minus');
    }

    /**
     * Gets the unselect button
     * @returns {Locator} The unselect button locator
     */
    getUnselectButton() {
        return this.selectionPanel.locator('.selectiontool-unselect');
    }

    /**
     * Gets the filter button
     * @returns {Locator} The filter button locator
     */
    getFilterButton() {
        return this.selectionPanel.locator('.selectiontool-filter');
    }

    /**
     * Gets the invert button
     * @returns {Locator} The invert button locator
     */
    getInvertButton() {
        return this.selectionPanel.locator('lizmap-selection-invert');
    }

    /**
     * Get the result container of the selection tool
     * @returns {Locator} The results container locator
     */
    getResultsContainer() {
        return this.selectionPanel.locator('.selectiontool-results');
    }

    /**
     * Select the geometry to draw
     * @param {string} type The geometry type.
     *                      Possible values 'point', 'line', 'polygon','box','circle','freehand'.
     */
    async selectGeometry(type) {
        await this.selectionPanel.locator('lizmap-digitizing .dropdown-toggle:nth-child(2)').click();
        await this.selectionPanel.locator(`lizmap-digitizing .digitizing-${type} > svg`).click();
    }

    /**
     * Select the layer to select on
     * @param {string} layer The layer name to select
     * @returns {Promise<void>} A promise that resolves when the layer is selected
     */
    async selectLayer(layer) {
        await this.selectionPanel.locator('lizmap-selection-tool .selectiontool-layer-list').selectOption(layer);
    }

    /**
     * Select the geometry operator to use for selection
     * @param {string} operator The geometry operator to select
     *                          Possible values 'intersects', 'within', 'overlaps', 'contains', 'crosses', 'disjoint', 'touches'.
     *                          Default is 'intersects'.
     * @returns {Promise<void>} A promise that resolves when the operator is selected
     */
    async selectGeomOperator(operator) {
        await this.selectionPanel.locator('lizmap-selection-tool .selectiontool-geom-operator').selectOption(operator);
    }
}
