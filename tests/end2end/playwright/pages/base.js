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
     * Debug bar
     * @type {Locator}
     */
    debugBar;

    /**
     * Constructor for a base page
     * @param {Page} page The playwright page
     */
    constructor(page) {
        this.page = page;
        this.headerMenu = page.locator('#headermenu');
        this.alert = page.locator('.alert');
        this.debugBar = page.locator('#jxdb');
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

    /**
     * getDebugBarWarning function
     * Get the warning img element in the debug bar
     * @returns {Promise<Locator>} The warning img element in the debug bar
     */
    async getDebugBarWarning(){
        return await this.debugBar.locator('#jxdb-header').getByAltText('warning', {exact: true});
    }

    /**
     * hasDebugBarWarnings function
     * Has warnings in the debug bar
     * @returns {Promise<boolean>} Has warnings in the debug bar
     */
    async hasDebugBarWarnings(){
        return await this.getDebugBarWarning().then(async w => await w.count() > 0);
    }

    /**
     * getDebugBarWarningMessage function
     * Get the warning's title in the debug bar
     * @returns {Promise<string>} Warning's title in the debug bar
     */
    async getDebugBarWarningMessage(){
        if (await this.hasDebugBarWarnings()) {
            const title = await this.getDebugBarWarning().then(async w => await w.getAttribute('title') ?? '');

            const messages = (await this.page.locator('#jxdb-errors li.jxdb-msg-warning h5').all())
                .map(async h5 => `  * Warning: ${await h5.innerText()}`)
                .filter((value, index, array) => array.indexOf(value) === index)
                .join('\n');
            return title+'\n'+messages;
        }
        return 'No warnings';
    }


    /**
     * getDebugBarErrors function
     * Get the warning img element in the debug bar
     * @returns {Promise<Locator>} The warning img element in the debug bar
     */
    async getDebugBarErrors(){
        return await this.debugBar.locator('#jxdb-header').getByAltText('Errors', {exact: true});
    }

    /**
     * hasDebugBarErrors function
     * Has warnings in the debug bar
     * @returns {Promise<boolean>} Has warnings in the debug bar
     */
    async hasDebugBarErrors(){
        return await this.getDebugBarErrors().then(async w => await w.count() > 0);
    }

    /**
     * getDebugBarErrorsMessage function
     * Get the warning's title in the debug bar
     * @returns {Promise<string>} Warning's title in the debug bar
     */
    async getDebugBarErrorsMessage(){
        if (await this.hasDebugBarErrors()) {
            const title = await this.getDebugBarErrors().then(async w => await w.getAttribute('title') ?? '');

            const messages =
                (await this.page.locator('#jxdb-errors li.jxdb-msg-error h5').all())
                    .map(async h5 => `  * Warning: ${await h5.innerText()}`)
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .join('\n')
                +
                (await this.page.locator('#jxdb-errors li.jxdb-msg-warning h5').all())
                    .map(async h5 => `  * Warning: ${await h5.innerText()}`)
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .join('\n');
            return title+'\n'+messages;
        }
        return 'No errors';
    }
}
