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

export class AtlasPage extends ProjectPage {
    // Metadata
    /**
     * The atlas panel
     * @type {Locator}
     */
    atlasPanel;

    /**
     * The atlas button on menu
     * @type {Locator}
     */
    atlasSwitcherButton;

    /**
     * The atlas feature select
     * @type {Locator}
     */
    atlasFeatureSelect;

    /**
     * The previous atlas button on atlas panel
     * @type {Locator}
     */
    atlasPreviousButton;

    /**
     * The next atlas button on atlas panel
     * @type {Locator}
     */
    atlasNextButton;

    /**
     * The run atlas button on atlas panel
     * @type {Locator}
     */
    atlasRunButton;

    /**
     * Constructor for a QGIS project page
     * @param {Page} page The playwright page
     * @param {string} project The project name
     * @param {string} repository The repository name, default to testsrepository
     */
    constructor(page, project, repository = 'testsrepository') {
        super(page, project, repository);

        this.atlasPanel = page.locator('#atlas');
        this.atlasSwitcherButton = page.locator('#button-atlas');
        this.atlasFeatureSelect = page.locator('#liz-atlas-select');
        this.atlasPreviousButton = this.atlasPanel.locator('button.liz-atlas-item[value="-1"]');
        this.atlasNextButton = this.atlasPanel.locator('button.liz-atlas-item[value="1"]');
        this.atlasRunButton = this.atlasPanel.locator('button.liz-atlas-run');
    }

    /**
     * openAtlasPanel function
     * opens the atlas right dock panel
     */
    async openAtlasPanel() {
        await this.atlasSwitcherButton.click();
    }

    /**
     * selectAtlasFeature function
     * selects a feature in the atlas panel
     * @param {string} featureId the feature id to select
     */
    async selectAtlasFeature(featureId) {
        await this.atlasFeatureSelect.selectOption(featureId);
    }

}
