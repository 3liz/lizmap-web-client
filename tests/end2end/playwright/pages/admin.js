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
        await expect(this.menu.locator('li.active')).toHaveText(expected);
    }
}
