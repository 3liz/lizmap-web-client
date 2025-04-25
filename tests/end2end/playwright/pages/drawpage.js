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
        await this.drawSwitcherButton.click();
    }

    /**
     * selectGeometry function
     * Select the geometry to draw
     * @param {string} type The geometry type.
     *                      Possible values 'point', 'line', 'polygon','box','circle','freehand','text'.
     */
    async selectGeometry(type) {
        await this.drawPanel.locator('button.dropdown-toggle:nth-child(2)').click();
        await this.drawPanel.locator(`.digitizing-${type} > svg`).click();
    }

    /**
     * toggleMeasure function
     * Toggle the measure tool
     */
    async toggleMeasure() {
        await this.drawPanel.locator('button.digitizing-toggle-measure').click();
    }

    /**
     * setMeasureConstraint function
     * @param {string} type The constraint type type. Possible values 'distance', 'angle'.
     * @param {string} value The constraint value.
     */
    async setMeasureConstraint(type, value) {
        await this.drawPanel.locator(`.digitizing-constraint-${type} input.${type}`).fill(value);
    }

    /**
     * deleteAllDrawings function
     * Delete all drawn features
     */
    async deleteAllDrawings(){
        this.page.once('dialog', (dialog) => dialog.accept());

        await this.drawPanel.locator('.digitizing-erase-all').click();
    }
}
