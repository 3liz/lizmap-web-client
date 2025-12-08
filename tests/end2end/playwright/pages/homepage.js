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

export class HomePage extends BasePage {

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
     * Search project locator
     * @type {Locator}
     */
    search;

    /**
     * Toggle search button project locator
     * @type {Locator}
     */
    toggleSearch;

    /**
     * Search keywords project locator
     * @type {Locator}
     */
    searchKeywords;

    /**
     * Search keywords project result locator
     * @type {Locator}
     */
    searchKeywordsResult;

    /**
     * Search keywords project items locator
     * @type {Locator}
     */
    searchKeywordsItems;

    /**
     * Search keywords project selected locator
     * @type {Locator}
     */
    searchKeywordsSelected;

    /**
     * Search keywords project selected items locator
     * @type {Locator}
     */
    searchKeywordsSelectedItems;

    /**
     * Constructor for main landing page of Lizmap
     * @param {Page} page The playwright page
     */
    constructor(page) {
        super(page);
        this.topContent = page.locator('#landingPageContent');
        this.bottomContent = page.locator('#landingPageContentBottom');
        this.search = page.locator('#search-project');
        this.toggleSearch = page.locator('#toggle-search');
        this.searchKeywords = page.locator('#search-project-keywords');
        this.searchKeywordsResult = page.locator('#search-project-result');
        this.searchKeywordsItems = this.searchKeywordsResult.locator('.project-keyword');
        this.searchKeywordsSelected = page.locator('#search-project-keywords-selected');
        this.searchKeywordsSelectedItems = this.searchKeywordsSelected.locator('.project-keyword');
    }

    /**
     * open function
     * Open the URL on the home page.
     */
    async open(){
        await this.page.goto('index.php');

        await expect(await this.hasDebugBarErrors(), (await this.getDebugBarErrorsMessage())).toBe(false);
        await expect(await this.hasDebugBarWarnings(), (await this.getDebugBarWarningMessage())).toBe(false);
    }
}
