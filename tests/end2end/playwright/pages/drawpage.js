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

export class DrawPage extends ProjectPage {
    // Metadata
    /**
     * The print panel
     * @type {Locator}
     */
    drawPanel;

    /**
     * The print button on menu
     * @type {Locator}
     */
    drawSwitcherButton;

    /**
     * The static tooltip containing the measurement of a finalized geometry.
     * @type {Locator}
     */
    mapAnnotationToolTipStatic;

    /**
     * The measure tooltip containing the measurement of a not finalized geometry.
     * @type {Locator}
     */
    mapAnnotationToolTipMeasure;

    /**
     * Constructor for a QGIS project page
     * @param {Page} page The playwright page
     * @param {string} project The project name
     * @param {string} repository The repository name, default to testsrepository
     */
    constructor(page, project, repository = 'testsrepository') {
        super(page, project, repository);

        this.drawPanel = page.locator('#draw');
        this.drawSwitcherButton = page.locator('#button-draw');
        this.mapAnnotationToolTipStatic = page.locator('.ol-tooltip.ol-tooltip-static');
        this.mapAnnotationToolTipMeasure = page.locator('.ol-tooltip.ol-tooltip-measure');
    }

    /**
     * openDrawPanel function
     * Opens the draw panel
     */
    async openDrawPanel() {
        if (!await this.drawPanel.isVisible()) {
            await this.drawSwitcherButton.click();
        }
    }

    /**
     * openDrawPanel function
     * Opens the draw panel
     */
    async closeDrawPanel() {
        if (await this.drawPanel.isVisible()) {
            await this.drawSwitcherButton.click();
        }
    }

    /**
     * Get selected tool button locator
     * @returns {Promise<Locator>} The selected tool button locator
     */
    async selectedToolLocator() {
        return this.drawPanel.locator('button.digitizing-selected-tool');
    }

    /**
     * selectGeometry function
     * Select the geometry to draw
     * @param {string} type The geometry type.
     *                      Possible values 'point', 'line', 'polygon','box','circle','freehand','text'.
     */
    async selectGeometry(type) {
        await this.drawPanel.locator('.dropdown-toggle:nth-child(2)').click();
        await this.drawPanel.locator(`.digitizing-${type} > svg`).click();
    }

    /**
     * toggleSelectedTool function
     * Toggle the selected tool
     */
    async toggleSelectedTool() {
        if (await this.drawPanel.locator('button.digitizing-selected-tool').getAttribute('value') != 'deactivate') {
            await this.drawPanel.locator('button.digitizing-selected-tool').click();
        }
    }

    /**
     * toggleEdit function
     * Toggle the edit tool
     */
    async toggleEdit() {
        await this.drawPanel.locator('button.digitizing-edit').click();
    }

    /**
     * toggleMeasure function
     * Toggle the measure tool
     */
    async toggleMeasure() {
        await this.drawPanel.locator('.digitizing-toggle-measure').click();
    }

    /**
     * setMeasureConstraint function
     * @param {string} type The constraint type type. Possible values 'distance', 'angle'.
     * @param {string} value The constraint value.
     */
    async setMeasureConstraint(type, value) {
        await this.drawPanel.locator(`.digitizing-constraints input.${type}`).fill(value);
    }

    /**
     * deleteAllDrawings function
     * Delete all drawn features
     */
    async deleteAllDrawings() {
        this.page.once('dialog', (dialog) => dialog.accept());

        await this.drawPanel.locator('.digitizing-erase-all').click();
    }

    /**
     * Get text content locator
     * @returns {Promise<Locator>} The text content locator
     */
    async textContentLocator() {
        return this.drawPanel.locator('#textContent');
    }

    /**
     * Get text content value
     * @returns {Promise<string>} The text content value
     */
    async textContentValue() {
        return this.drawPanel.locator('#textContent').inputValue();
    }

    /**
     * Set text content value
     * @param {string} text The text content value
     * @returns {Promise<void>}
     */
    async setTextContentValue(text) {
        return this.drawPanel.locator('#textContent').fill(text);
    }

    /**
     * Get text rotation locator
     * @returns {Promise<Locator>} The text rotation locator
     */
    async textRotationLocator() {
        return this.drawPanel.locator('#textRotation');
    }

    /**
     * Get text rotation value
     * @returns {Promise<string>} The text rotation value
     */
    async textRotationValue() {
        return this.drawPanel.locator('#textRotation').inputValue();
    }

    /**
     * Set text rotation value
     * @param {string} rotation The text rotation value
     * @returns {Promise<void>}
     */
    async setTextRotationValue(rotation) {
        return this.drawPanel.locator('#textRotation').fill(rotation);
    }

    /**
     * Get text scale locator
     * @returns {Promise<Locator>} The text scale locator
     */
    async textScaleLocator() {
        return this.drawPanel.locator('#textScale');
    }

    /**
     * Get text scale value
     * @returns {Promise<string>} The text scale value
     */
    async textScaleValue() {
        return this.drawPanel.locator('#textScale').inputValue();
    }

    /**
     * Set text scale value
     * @param {string} scale The text scale value
     * @returns {Promise<void>}
     */
    async setTextScaleValue(scale) {
        return this.drawPanel.locator('#textScale').fill(scale);
    }
}
