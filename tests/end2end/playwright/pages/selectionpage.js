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

    /**
     * The selection panel
     * @type {Locator}
     */
    selectionPanel;

    /**
     * The selection tool element
     * @type {Locator}
     */
    selectionToolElement;

    /**
     * The selection button on menu
     * @type {Locator}
     */
    selectionSwitcherButton;

    /**
     * The selection message
     * @type {Locator}
     */
    selectionMessage;

    /**
     * Constructor for a QGIS project page
     * @param {Page} page The playwright page
     * @param {string} project The project name
     * @param {string} repository The repository name, default to testsrepository
     */
    constructor(page, project, repository = 'testsrepository') {
        super(page, project, repository);

        this.selectionPanel = page.locator('#selectiontool');
        this.selectionToolElement = this.selectionPanel.locator('lizmap-selection-tool');
        this.selectionSwitcherButton = page.locator('#button-selectiontool');
        this.selectionMessage = page.locator('#lizmap-selection-message');
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
     * Gets the layer list
     * @returns {Locator} The layer list locator
     */
    getLayerList() {
        return this.selectionToolElement.locator('.selectiontool-layer-list');
    }


    /**
     * Gets the digitizing toolbar
     * @returns {Locator} The digitizing toolbar locator
     */
    getDigitizingToolBar() {
        return this.selectionToolElement.locator('lizmap-digitizing');
    }

    /**
     * Gets the buffer input
     * @returns {Locator} The buffer input locator
     */
    getBufferInput() {
        return this.selectionToolElement.locator('.selectiontool-buffer input');
    }

    /**
     * Gets the buffer geom operator select
     * @returns {Locator} The buffer geom operator select locator
     */
    getBufferGeomOperatorSelect() {
        return this.selectionToolElement.locator('.selectiontool-geom-operator');
    }

    /**
     * Get the result container of the selection tool
     * @returns {Locator} The results container locator
     */
    getResultsContainer() {
        return this.selectionToolElement.locator('.selectiontool-results');
    }

    /**
     * Gets the refresh button
     * @returns {Locator} The refresh button locator
     */
    getRefreshButton() {
        return this.selectionToolElement.locator('.selectiontool-type-refresh');
    }

    /**
     * Gets the plus button
     * @returns {Locator} The plus button locator
     */
    getPlusButton() {
        return this.selectionToolElement.locator('.selectiontool-type-plus');
    }

    /**
     * Gets the minus button
     * @returns {Locator} The minus button locator
     */
    getMinusButton() {
        return this.selectionToolElement.locator('.selectiontool-type-minus');
    }

    /**
     * Gets the unselect button
     * @returns {Locator} The unselect button locator
     */
    getUnselectButton() {
        return this.selectionToolElement.locator('.selectiontool-unselect');
    }

    /**
     * Gets the filter button
     * @returns {Locator} The filter button locator
     */
    getFilterButton() {
        return this.selectionToolElement.locator('.selectiontool-filter');
    }

    /**
     * Gets the invert button
     * @returns {Locator} The invert button locator
     */
    getInvertButton() {
        return this.selectionToolElement.locator('lizmap-selection-invert button');
    }

    /**
     * Gets the export button
     * @returns {Locator} The export button locator
     */
    getExportButton() {
        return this.selectionToolElement.locator('.selectiontool-export button');
    }

    /**
     * Gets the export formats list
     * @returns {Locator} The export formats list locator
     */
    getExportFormatsList() {
        return this.selectionToolElement.locator('.selectiontool-export-formats');
    }

    /**
     * Gets the export formats items
     * @returns {Locator} The export formats items locator
     */
    getExportFormatsItems() {
        return this.getExportFormatsList().locator('.dropdown-item');
    }

    /**
     * Select the geometry to draw
     * @param {string} type The geometry type.
     *                      Possible values 'point', 'line', 'polygon','box','circle','freehand'.
     */
    async selectGeometry(type) {
        await this.getDigitizingToolBar().locator('.digitizing-buttons .dropdown-toggle-split').click();
        await this.getDigitizingToolBar().locator(`.digitizing-${type}`).click();
    }

    /**
     * Select the layer to select on
     * @param {string} layer The layer name to select
     * @returns {Promise<void>} A promise that resolves when the layer is selected
     */
    async selectLayer(layer) {
        await this.getLayerList().selectOption(layer);
    }

    /**
     * Select the geometry operator to use for selection
     * @param {string} operator The geometry operator to select
     *                          Possible values 'intersects', 'within', 'overlaps', 'contains', 'crosses', 'disjoint', 'touches'.
     *                          Default is 'intersects'.
     * @returns {Promise<void>} A promise that resolves when the operator is selected
     */
    async selectGeomOperator(operator) {
        await this.getBufferGeomOperatorSelect().selectOption(operator);
    }
}
