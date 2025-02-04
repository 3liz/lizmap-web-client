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

/**
 * @typedef {Object} logMessage
 * @property {string} type - the log type :One of the following values:
 * 'log', 'debug', 'info', 'error', 'warning', 'dir', 'dirxml', 'table',
 * 'trace', 'clear', 'startGroup', 'startGroupCollapsed', 'endGroup',
 * 'assert', 'profile', 'profileEnd', 'count', 'timeEnd'.
 * @property {string} message - the log message text
 * @property {string} location - the log message location in one line
 * @see https://playwright.dev/docs/api/class-consolemessage
 */

export class BasePage {
    /** @type {Page} */
    page;

    /**
     * Logs collected
     * @type {logMessage[]}
     */
    logs = [];

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

        const logs = this.logs;
        page.on('console', message => {
            // Default message from jQuery: JQMIGRATE: Migrate is installed, version 3.3.1
            // Do not stored it - will be removed when we are sure that this log will not appear
            if (message.type() === 'log' && message.text().startsWith('JQMIGRATE: Migrate is installed')) {
                return;
            }
            const location = message.location()
            logs.push({
                type: message.type(),
                message: message.text(),
                location: `${location.url}:${location.lineNumber}:${location.columnNumber}`
            })
        })
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
