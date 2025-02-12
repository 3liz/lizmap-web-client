// @ts-check

import { expect } from '@playwright/test';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Locator
 * @typedef {import('@playwright/test').Locator} Locator
 */

export class BasePage {
    /** @type {Page} */
    page;

    /**
     * Header menu
     * @type {Locator}
     */
    headerMenu;

    /**
     * Top message bar
     * @type {Locator}
     */
    alert;

    /**
     * Constructor for a base page
     * @param {Page} page The playwright page
     */
    constructor(page) {
        this.page = page;
        this.headerMenu = page.locator('#headermenu');
        this.alert = page.locator('.alert');
    }

    /**
     * Check main alert message : level and content if necessary
     * @param {string} level Name of the CSS class for the level
     * @param {string} message Content of the message, if necessary
     */
    async checkAlert(level, message) {
        await expect(this.alert).toHaveClass(new RegExp(level, "g"));
        if (message) {
            await expect(this.alert).toHaveText(message);
        }
    }
}
