// @ts-check

import {Locator, Page} from '@playwright/test';
import { BasePage } from './base';

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
}
