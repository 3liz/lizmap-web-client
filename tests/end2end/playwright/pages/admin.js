// @ts-check

import { expect } from '@playwright/test';
import { BasePage } from './base';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Locator
 * @typedef {import('@playwright/test').Locator} Locator
 */

export class AdminPage extends BasePage {
    /**
     * Main administrator menu
     * @type {Locator}
     */
    menu;

    /**
     * Main administrator message bar
     * @type {Locator}
     */
    warningMessage;

    /**
     * Constructor for an administrator page
     * @param {Page} page The playwright page
     */
    constructor(page) {
        super(page);
        this.menu = page.locator('#menu');
        this.warningMessage = page.locator('.alert');
    }

    /**
     * open function
     * Open the URL on the home page.
     */
    async open(){
        await this.page.goto('admin.php');

        await expect(await this.hasDebugBarErrors(), (await this.getDebugBarErrorsMessage())).toBe(false);
        await expect(await this.hasDebugBarWarnings(), (await this.getDebugBarWarningMessage())).toBe(false);
    }

    /**
     * Navigate in the administrator menu by clicking in the menu
     * @param {string} expected Name of the page
     */
    async openPage(expected){
        await this.page.getByRole('link', { name: expected }).click();
        await this.checkPage(expected);
    }

    /**
     * Check that the menu is OK
     * @param {string} expected Name of the page
     */
    async checkPage(expected){
        await expect(this.page.getByRole('link', { name: expected })).toContainClass('active');
    }

    /**
     * Open Maps management page in editing mode
     * @param {string} repository The repository name
     */
    async modifyRepository(repository){
        const modifyButton = this.page.locator('#'+repository).getByRole('link', { name: 'Modify' });
        await modifyButton.scrollIntoViewIfNeeded();
        await modifyButton.click();
    }

    /**
     * Remove all groups from layer export permissions section
     */
    async uncheckAllExportPermission(){
        const groups = this.page.locator('.jforms-ctl-lizmap\\.tools\\.layer\\.export input');
        for (let i = 0; i < await groups.count(); i++) {
            await groups.nth(i).uncheck();
        }
    }

    /**
     * Set layers export permissions on specific groups
     * @param {string[]} groups Array of groups
     */
    async setLayerExportPermission(groups){
        for (const group of groups) {
            await this.page.locator('.jforms-ctl-lizmap\\.tools\\.layer\\.export input[value="'+group+'"]').check();
        }
    }

    /**
     * Reset layers export permissions
     */
    async resetLayerExportPermission(){
        const groups = [
            '__anonymous',
            'admins',
            'group_a',
            'group_b',
            'publishers',
        ];

        await this.uncheckAllExportPermission();

        for (const group of groups){
            await this.page.locator('.jforms-ctl-lizmap\\.tools\\.layer\\.export input[value="'+group+'"]').check();
        }
    }
}
