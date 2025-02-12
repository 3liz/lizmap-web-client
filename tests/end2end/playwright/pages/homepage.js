// @ts-check
import { BasePage } from './base';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Locator
 * @typedef {import('@playwright/test').Locator} Locator
 */

export class HomePage extends BasePage {
    /**
     * Search project locator
     * @type {Locator}
     */
    search;

    /**
     * Top text locator
     * @type {Locator}
     */
    topContent;

    /**
     * Bottom text locator
     * @type {Locator}
     */
    bottomContent;

    /**
     * Constructor for main landing page of Lizmap
     * @param {Page} page The playwright page
     */
    constructor(page) {
        super(page);
        this.topContent = page.locator('#landingPageContent');
        this.bottomContent = page.locator('#landingPageContentBottom');
        this.search = page.locator('#search');
    }

    /**
     * open function
     * Open the URL on the home page.
     */
    async open(){
        await this.page.goto('index.php');
    }
}
