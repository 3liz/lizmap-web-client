// @ts-check
import { expect } from '@playwright/test';
import { ProjectPage } from './project';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Locator} Locator
 */

export class PrintPage extends ProjectPage {
    // Metadata
    /**
     * The print panel
     * @type {Locator}
     */
    printPanel;

    /**
     * The print button on menu
     * @type {Locator}
     */
    printSwitcherButton;

    /**
     * The print scale combobox
     * @type {Locator}
     */
    printScale;

    /**
     * The launch print button on print panel
     * @type {Locator}
     */
    launchPrintButton;

    /**
     * Constructor for a QGIS project page
     * @param {Page} page The playwright page
     * @param {string} project The project name
     * @param {string} repository The repository name, default to testsrepository
     */
    constructor(page, project, repository = 'testsrepository') {
        super(page, project, repository);

        this.printPanel = page.locator('#print');
        this.printSwitcherButton = page.locator('#button-print');
        this.launchPrintButton = page.locator('#print-launch');
        this.printScaleCombobox = page.locator('#print-scale');
    }

    /**
     * openPrintPanel function
     * opens the print mini-dock panel
     */
    async openPrintPanel() {
        await this.page.locator('#button-print').click();
    }

    /**
     * setPrintScale function
     * Set the print scale
     * @param {string} scale The scale
     */
    async setPrintScale(scale) {
        await this.printScaleCombobox.selectOption(scale);
    }

    /**
     * launchPrint function
     * Launch print
     */
    async launchPrint() {
        // Launch print
        await this.launchPrintButton.click();
        // check message
        await expect(this.page.locator('div.alert')).toHaveCount(1);
    }
}
