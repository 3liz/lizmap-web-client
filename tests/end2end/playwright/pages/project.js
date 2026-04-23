// @ts-check
import { expect } from '@playwright/test';
import { gotoMap, qgsTestFile } from '../globals';
import { BasePage } from './base';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Locator
 * @typedef {import('@playwright/test').Locator} Locator
 */

/**
 * Playwright Request
 * @typedef {import('@playwright/test').Request} Request
 */

/**
 * Integer
 * @typedef {number} int
 */

/**
 * Console log message
 * @typedef {object} logMessage
 * @property {string} type - the log type :One of the following values:
 * 'log', 'debug', 'info', 'error', 'warning', 'dir', 'dirxml', 'table',
 * 'trace', 'clear', 'startGroup', 'startGroupCollapsed', 'endGroup',
 * 'assert', 'profile', 'profileEnd', 'count', 'timeEnd'.
 * @property {string} message - the log message text
 * @property {string} location - the log message location in one line
 * @see https://playwright.dev/docs/api/class-consolemessage
 */
export class ProjectPage extends BasePage {
    // Metadata
    /**
     * Project name metadata
     * @type {string}
     */
    project;
    /**
     * Repository name metadata
     * @type {string}
     */
    repository;

    // Maps
    /**
     * The OpenLayers main map
     * @type {Locator}
     */
    map;
    /**
     * The OpenLayers OL2 legacy map
     * @type {Locator}
     */
    mapOl2;
    /**
     * The map's navigation bar
     * @type {Locator}
     */
    navBar;

    // Menu
    /**
     * Layer switcher menu
     * @type {Locator}
     */
    switcher;

    /**
     * Editing menu
     * @type {Locator}
     */
    buttonEditing;

    // Docks
    /**
     * Main left dock
     * @type {Locator}
     */
    dock;
    /**
     * Right dock
     * @type {Locator}
     */
    rightDock;
    /**
     * Bottom dock
     * @type {Locator}
     */
    bottomDock;
    /**
     * Mini dock
     * @type {Locator}
     */
    miniDock;
    /**
     * Popup content
     * @type {Locator}
     */
    popupContent;
    /**
     * Lizmap Tree View
     * @type {Locator}
     */
    treeView;
    /**
     * Base layer select
     * @type {Locator}
     */
    baseLayerSelect;
    /**
     * Top search bar
     * @type {Locator}
     */
    search;

    // form
    /**
     * Edition form
     * @type {Locator}
     */
    editionForm;

    // Messages
    /**
     * Foreground message bar
     * @type {Locator}
     */
    warningMessage;

    /**
     * Logs collected
     * @type {logMessage[]}
     */
    logs = [];

    /**
     * Path to the QGS file
     * @type {string}
     */
    get qgsFile() {return qgsTestFile(this.project, this.repository)};

    /**
     * Does the loading of the map must be successful or not ? Some error might
     * be triggered when loading the map, on purpose.
     * @type {boolean}
     */
    mapMustLoad = true;

    /**
     * The number of layers to find in the treeview if the map is on error.
     * @type {int}
     */
    layersInTreeView = 0;

    /**
     * During openning page, does the test must wait for the GetLegendGraphic request ?
     * @type {boolean}
     */
    waitForGetLegendGraphicDuringLoad = true;

    /**
     * Attribute table wrapper for the given layer name
     * @param {string} name Name of the layer
     * @returns {Locator} Locator for attribute table wrapper
     */
    attributeTableWrapper = (name) =>
        this.page.locator(`#attribute-layer-table-${name}_wrapper`);

    /**
     * Attribute table for the given layer name
     * @param {string} name Name of the layer
     * @returns {Locator} Locator for attribute table
     */
    attributeTableHtml = (name) =>
        this.page.locator(`#attribute-layer-table-${name}`);

    /**
     * Attribute table action bar for the given layer name
     * @param {string} name Name of the layer
     * @returns {Locator} Locator for attribute table action bar
     */
    attributeTableActionBar = (name) =>
        this.page.locator(`#attribute-layer-${name} .attribute-layer-action-bar`);

    /**
     * Editing field for the given field in the panel
     * @param {string} name Name of the field
     * @returns {Locator} Locator for the field (input, select, textarea)
     */
    editingField = (name) =>
        this.editionForm.locator(`input[name="${name}"], select[name="${name}"], textarea[name="${name}"]`);

    /**
     * Editing submit for the given type
     * @param {string} type Submit type: submit or cancel
     * @returns {Locator} Locator for the submit button
     */
    editingSubmit = (type) =>
        this.editionForm.locator(`#jforms_view_edition__submit_${type}`);

    /**
     * Constructor for a QGIS project page
     * @param {Page} page The playwright page
     * @param {string} project The project name
     * @param {string} repository The repository name, default to testsrepository
     */
    constructor(page, project, repository = 'testsrepository') {
        super(page);
        this.project = project;
        this.repository = repository;
        this.map = page.locator('#newOlMap');
        this.mapOl2 = page.locator('#map');
        this.navBar = page.locator('#navbar');
        this.dock = page.locator('#dock');
        this.rightDock = page.locator('#right-dock');
        this.bottomDock = page.locator('#bottom-dock');
        this.miniDock = page.locator('#mini-dock-content');
        this.popupContent = page.locator('#popupcontent');
        this.treeView = page.locator('#switcher lizmap-treeview');
        this.warningMessage = page.locator('#lizmap-warning-message');
        this.search = page.locator('#search-query');
        this.switcher = page.locator('#button-switcher');
        this.baseLayerSelect = page.locator('#switcher-baselayer').getByRole('combobox')
        this.buttonEditing = page.locator('#button-edition');
        this.buttonMetadata = page.locator('#button-metadata');
        this.editionForm = page.locator('#jforms_view_edition');

        const logs = this.logs;
        page.on('console', message => {
            // Default message from jQuery: JQMIGRATE: Migrate is installed, version 3.3.1
            // Do not stored it - will be removed when we are sure that this log will not appear
            if (message.type() == 'log' && message.text().startsWith('JQMIGRATE: Migrate is installed')) {
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
     * Waits for a GetMap request
     * @param {undefined|string} layers The LAYERS parameter in url
     * @returns {Promise<Request>} The GetMap request
     */
    async waitForGetMapRequest(layers=undefined) {
        if (layers === undefined) {
            return this.page.waitForRequest(
                request => request.method() === 'GET' &&
                request.url().includes('WMS') === true &&
                request.url().includes('GetMap') === true
            );
        }

        return this.page.waitForRequest(
            request => {
                if (request.method() !== 'GET') return false;
                const url = request.url();
                if (!url.includes('WMS') || !url.includes('GetMap')) return false;
                // Check for multiple layers (comma-separated) to filter out single basemap requests
                const layersMatch = url.match(/LAYERS=([^&]*)/i);
                if (!layersMatch) return false;
                return layersMatch[1] === layers;
            }
        );
    }

    /**
     * Waits for a single WMS GetMap request (with multiple layers)
     * This filters out basemap-only GetMap requests which have only one layer
     * Single WMS requests combine multiple layers, so LAYERS contains commas
     * @returns {Promise<Request>} The single WMS GetMap request
     */
    async waitForSingleWMSGetMapRequest() {
        return this.page.waitForRequest(
            request => {
                if (request.method() !== 'GET') return false;
                const url = request.url();
                if (!url.includes('WMS') || !url.includes('GetMap')) return false;
                // Check for multiple layers (comma-separated) to filter out single basemap requests
                const layersMatch = url.match(/LAYERS=([^&]*)/i);
                if (!layersMatch) return false;
                return layersMatch[1].includes('%2C') || layersMatch[1].includes(',');
            }
        );
    }

    /**
     * Waits for a GetTile request
     * @returns {Promise<Request>} The GetTile request
     */
    async waitForGetTileRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'GET' &&
            request.url().includes('WMTS') === true &&
            request.url().includes('GetTile') === true
        );
    }

    /**
     * Waits for a GetFeatureInfo request
     * @returns {Promise<Request>} The GetFeatureInfo request
     */
    async waitForGetFeatureInfoRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('WMS') === true &&
            request.postData()?.includes('GetFeatureInfo') === true
        );
    }

    /**
     * Waits for a GetSelectionToken request
     * @returns {Promise<Request>} The GetSelectionToken request
     */
    async waitForGetSelectionTokenRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('WMS') === true &&
            request.postData()?.includes('GETSELECTIONTOKEN') === true
        );
    }

    /**
     * Waits for a GetFilterToken request
     * @returns {Promise<Request>} The GetFilterToken request
     */
    async waitForGetFilterTokenRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('WMS') === true &&
            request.postData()?.includes('GETFILTERTOKEN') === true
        );
    }

    /**
     * Waits for a GetFeature request
     * @param {undefined|string} featureType Optional TYPENAME to filter on
     * @returns {Promise<Request>} The GetFeature request
     */
    async waitForGetFeatureRequest(featureType = undefined) {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('WFS') === true &&
            request.postData()?.includes('GetFeature') === true &&
            (featureType === undefined || request.postData()?.includes(featureType) === true)
        );
    }

    /**
     * Waits for a GetPlot request
     * @param {undefined|string} plot_id The plot id in post data
     * @returns {Promise<Request>} The GetFeature request
     */
    async waitForGetPlotRequest(plot_id=undefined) {
        if (plot_id === undefined) {
            return this.page.waitForRequest(
                request => request.method() === 'POST' &&
                request.postData()?.includes('getPlot') === true
            );
        }

        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('getPlot') === true &&
            request.postData()?.includes('plot_id') === true &&
            request.postDataJSON()?.plot_id == plot_id
        );
    }

    /**
     * Waits for a editableFeatures request
     * @returns {Promise<Request>} The editableFeature request
     */
    async waitForEditableFeaturesRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.url().includes('editableFeatures') === true &&
            request.postData()?.includes('features') === true
        );
    }

    /**
     * Waits for a datatables request
     * @returns {Promise<Request>} The datatables request
     */
    async waitForDatatablesRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.url().includes('datatables') === true &&
            request.postData()?.includes('draw') === true
        );
    }

    /**
     * Waits for a datatables zomm to extent request
     * @returns {Promise<Request>} The datatables request
     */
    async waitForDatatablesZoomExtentRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.url().includes('datatables') === true &&
            request.url().includes('filteredFeaturesExtent') === true &&
            request.postData()?.includes('draw') === true
        );
    }

    /**
     * Waits for a permalink get request
     * @returns {Promise<Request>} The permalink request
     */
    async waitForPermalinkGetRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'GET' &&
            request.url().includes('/permalink') === true &&
            request.url().includes('id') === true
        );
    }

    /**
     * Waits for a permalink add request
     * @returns {Promise<Request>} The permalink request
     */
    async waitForPermalinkAddRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.url().includes('/permalink') === true &&
            request.postData()?.includes('permalink') === true
        );
    }

    /**
     * open function
     * Open the URL for the given project and repository
     * @param {boolean} skip_plugin_update_warning Skip UI warning about QGIS plugin version, false by default.
     * @param {string} hash Load page with url hash.
     */
    async open(skip_plugin_update_warning = false, hash = ''){
        // By default, do not display warnings about old QGIS plugin or outdated Action JSON file
        await this.openWithExtraParams({skip_plugin_update_warning: skip_plugin_update_warning}, hash);
    }

    /**
     * Open the URL for the given project and repository with extra parameters
     * @param {object} params Parameters to add to the default repository and project parameters.
     * Example: {skip_plugin_update_warning: true}
     * @param {string} hash Load page with url hash
     * @returns {Promise<void>}
     */
    async openWithExtraParams(params, hash = ''){
        const searchParams = new URLSearchParams();
        searchParams.set('repository', this.repository);
        searchParams.set('project', this.project);
        // By default, do not display warnings about old QGIS plugin or outdated Action JSON file
        // It could be superseeded by the params parameter
        searchParams.set('skip_plugin_update_warning', 'false');
        for (const [key, value] of Object.entries(params)) {
            searchParams.set(key, value);
        }
        await gotoMap(
            `/index.php/view/map?${searchParams.toString()}${hash ? hash : ''}`,
            this.page,
            this.mapMustLoad,
            this.layersInTreeView,
            this.waitForGetLegendGraphicDuringLoad,
        );

        await expect(await this.hasDebugBarErrors(), (await this.getDebugBarErrorsMessage())).toBe(false);
        await expect(await this.hasDebugBarWarnings(), (await this.getDebugBarWarningMessage())).toBe(false);
    }

    /**
     * Zoom in
     */
    async zoomIn() {
        await this.navBar.locator('button.btn.zoom-in').click();
    }

    /**
     * Zoom out
     */
    async zoomOut() {
        await this.navBar.locator('button.btn.zoom-out').click();
    }

    /**
     * Zoom to initial extent
     */
    async zoomToInitialExtent() {
        await this.navBar.locator('button.btn.zoom-extent').click();
    }

    /**
     * @param {string} layer The layer name
     * @param {string} style Destination style
     * @returns {Promise<void>}
     */
    async changeLayerStyle(layer, style){
        await this.openLayerInfo(layer);
        await this.page.locator("#sub-dock").locator("select.styleLayer").selectOption(style);
    }

    /**
     * openAttributeTable function
     * Open the attribute table for the given layer
     * @param {string} layer Name of the layer
     * @param {boolean} maximise If the attribute table must be maximised
     * @returns {Promise<Request>} the request generated by opening the attribute table
     */
    async openAttributeTable(layer, maximise = false){
        if (!await this.page.locator('#attributeLayers').isVisible()) {
            await this.page.locator('a#button-attributeLayers').click();
            if (maximise) {
                await this.page.getByRole('button', { name: 'Maximize' }).click();
            }
        }
        if (!await this.page.locator('#attribute-summary').isVisible()) {
            await this.page.locator('#nav-tab-attribute-summary').click();
        }
        const datatablesPromise = this.waitForDatatablesRequest();
        await this.page.locator('#attribute-layer-list-table').locator(`button[value=${layer}]`).click();
        return await datatablesPromise;
    }

    /**
     * closeAttributeTable function
     * Close each layer panel and close attribute table dock
     */
    async closeAttributeTable(){
        const tabsCloseButtons = await this.page.locator('.btn-close-attribute-tab');
        for (let i = 0; i < await tabsCloseButtons.count(); i ++){
            await tabsCloseButtons.nth(i).click();
        }

        await this.page.locator('a#button-attributeLayers').click();
    }

    /**
     * Switch to given attribute table
     * @param {string} tableName Name of the attribute table to visualize
     * @returns {Promise<void>}
     */
    async switchAttributeTable(tableName){
        await this.page.locator(`#nav-tab-attribute-layer-${tableName}`).click();
    }

    /**
     * Switch to given child attribute table
     * @param {string} tableName Name of the attribute table to visualize
     * @returns {Promise<void>}
     */
    async switchChildAttributeTable(tableName){
        await this.page.locator(`#nav-tab-attribute-child-tab-${tableName}`).click();
    }

    /**
     * Open search builder attribute table panel. Optionally can clear all criteria
     * @param {string}  name Name of the table
     * @param {boolean} clearAll Wheter to clear all conditions or not
     */
    async openSearchBuilderPanel(name, clearAll = false){
        await this.attributeTableActionBar(name).locator('.dt-buttons.btn-group.flex-wrap button').click();
        if(clearAll) {
            await this.attributeTableActionBar(name).locator('button.dtsb-clearAll').click();
        }
    }

    /**
     * Adds a blank criterion and returns corresponding locator. Optionally, checks the available fields
     * @param {string} name The table name
     * @param {string[]|null} expectedFields Expected fields to check
     * @returns {Promise<void>}
     */
    async addSearchBuilderCriterion(name, expectedFields = null){
        await this.attributeTableActionBar(name).locator('button.dtsb-add').click();
        // select last added criterion
        const addedCriterion = await this.attributeTableActionBar(name).locator('.dtsb-criteria').last();

        if (expectedFields) {
            expectedFields.forEach(async (field) => {
                await expect(addedCriterion.locator('select.dtsb-data').getByText(field)).toHaveCount(1);
            })
        }
    }

    /**
     * Gets the given criterion locator
     * @param {string} name The table name
     * @param {number} criterionIndex DOM index of the criterion to retrieve
     * @returns {Promise<Locator>} The criterion locator
     */
    async getSearchBuilderCriterion(name, criterionIndex){
        return this.attributeTableActionBar(name).locator('.dtsb-criteria').nth(criterionIndex);
    }

    /**
     * Removes the given criterion
     * @param {Locator} criterion The criterion locator
     * @returns {Promise<void>}
     */
    async removeSearchBuilderCriterion(criterion){
        await criterion.locator('.dtsb-delete').click();
    }

    /**
     * Selects a data for the given criterion and optionally checks the availble conditions
     * @param {Locator} criterion The criterion locator
     * @param {string} data Option to select
     * @param {string[]|null} expectedConditions Expected selectable conditions
     * @returns {Promise<void>}
     */
    async selectSearchBuilderData(criterion, data, expectedConditions = null){
        await criterion.locator('select.dtsb-data').selectOption({label: data});
        // select last condition added
        const condition = criterion.locator('select.dtsb-condition');

        if (expectedConditions) {
            const options = condition.locator('option').all();
            for (const option of await options) {
                const optionValue = await option.getAttribute("value") || '';
                if (optionValue) {
                    if(expectedConditions.indexOf(optionValue) > -1) {
                        expect(await option.evaluate(op => op.style.display )).toBe('');
                    } else expect(await option.evaluate(op => op.style.display )).toBe('none');
                }
            }
        }
    }

    /**
     * Select a condition for the given criterion
     * @param {Locator} criterion The criterion locator
     * @param {string} condition The selected condition
     * @returns {Promise<void>}
     */
    async selectSearchBuilderCondition(criterion, condition){
        await criterion.locator('select.dtsb-condition').selectOption(condition);
    }

    /**
     * Performs filtering for the given attribute table
     * @param {string} tableName Attribute table to filter
     * @returns {Promise<void>}
     */
    async searchBuilderLaunchSearch(tableName){
        await this.attributeTableActionBar(tableName).locator('.dtsb-search').click();
    }

    /**
     * Toggles the search builder logical operator for the given table.
     * @param {string} tableName Attribute table to filter
     * @returns {Promise<void>}
     */
    async toggleSearchBuilderLogicalCondition(tableName){
        await this.attributeTableActionBar(tableName).locator('.dtsb-logic').click();
    }

    /**
     * Closes the search builder filter panel for the given table
     * @param {string} tableName Attribute table containing the search builder panel
     * @returns {Promise<void>}
     */
    async searchBuilderClosePanel(tableName){
        await this.attributeTableActionBar(tableName).locator('.dtb-popover-close').click();
    }

    /**
     * Fills typeahead input with given text. Optionally, checks the resulting displayed options
     * @param {Locator} typeaheadNode Typeahead element locator
     * @param {string} text Text to fill
     * @param {string[]|null} expected_options List of displayed options to check
     * @returns {Promise<void>}
     */
    async fillTypeAHeadInput(typeaheadNode, text, expected_options = null){
        await typeaheadNode.locator('.lizmap-typeahead-text').pressSequentially(text);
        if(expected_options){
            await this.typeAHeadCheckResultOptions(typeaheadNode, expected_options)
        }
    }

    /**
     * Fills searchBuilder input with given text.
     * @param {Locator} inputNode Typeahead element locator
     * @param {string} text Text to fill
     * @returns {Promise<void>}
     */
    async fillSearchBuilderInput(inputNode, text){
        await inputNode.pressSequentially(text);
    }

    /**
     * Checks the results options list for the given typeahead node
     * @param {Locator} typeaheadNode Typeahead locator
     * @param {string[]} expected_options List of displayed options to check
     * @returns {Promise<void>}
     */
    async typeAHeadCheckResultOptions(typeaheadNode, expected_options){
        const optionContainer = typeaheadNode.locator('.lizmap-typeahead-options-container');
        await expect(optionContainer).toBeVisible();
        const displayed_options = optionContainer.locator('span[data-lizmap-typeahead]');
        await expect(displayed_options).toHaveCount(expected_options.length);
        let c = 0;
        for (const opt of await displayed_options.all()){
            expect(await opt.innerText()).toBe(expected_options[c]);
            c++;
        }
    }

    /**
     * Selects an option for the given typeahead node
     * @param {Locator} typeaheadNode Typeahead locator
     * @param {string} optionValue Actual value of the option
     * @param {string} optionDescription Text specifying the option to select
     * @returns {Promise<void>}
     */
    async selectTypeAHeadOption(typeaheadNode, optionValue, optionDescription){
        await typeaheadNode
            .locator('.lizmap-typeahead-options-container span[data-lizmap-typeahead]')
            .getByText(optionDescription)
            .click();
        await this.checkTypeAHeadValues(typeaheadNode, optionValue, optionDescription);
    }

    /**
     * Checks the given typeahead node state
     * @param {Locator} typeaheadNode Typeahead locator
     * @param {string} value Actual option value
     * @param {string} description Actual option description
     * @returns {Promise<void>}
     */
    async checkTypeAHeadValues(typeaheadNode, value, description){
        await expect(typeaheadNode.locator('.lizmap-typeahead-input')).toHaveValue(value);
        await expect(typeaheadNode.locator('.lizmap-typeahead-text')).toHaveValue(description);
    }

    /**
     * launchExport function
     * @param {string} layer     - the layer to export
     * @param {string} format - the format to export
     * @returns {Promise<Request>} the request generated by the export
     */
    async launchExport(layer, format){
        const getFeatureRequestPromise = this.waitForGetFeatureRequest();
        await this.page.getByRole('button', { name: 'Export' }).click();
        await this.page.getByRole('button', { name: format }).click();
        return await getFeatureRequestPromise;
    }

    /**
     * openLayerInfo function
     * Open the info layer panel for the given layer
     * @param {string} layer Name of the layer
     */
    async openLayerInfo(layer) {
        await this.page.getByTestId(layer).locator('.node').first().hover();
        await this.page.getByTestId(layer).locator('.layer-actions').first().locator('i.icon-info-sign').click();
    }

    /**
     * setLayerOpacity function
     * Open the info layer panel for the given layer
     * @param {string} layer Name of the layer
     * @param {string} opacity Layer opacity, possible values '0','20','40','60','80','100'
     */
    async setLayerOpacity(layer, opacity = '100') {
        await this.openLayerInfo(layer);
        await this.page.getByRole('link', { name: opacity }).click();
    }

    /**
     * editingSubmitForm function
     * Submit the form
     * @param {string} futureAction The action to do after submit : can be close/create/edit.
     */
    async editingSubmitForm(futureAction = 'close'){
        const submit = this.editingSubmit('submit');
        if (!await submit.isVisible()) {
            //await this.page.locator('#jforms_view_edition__submit_submit').scrollIntoViewIfNeeded();
            await submit.scrollIntoViewIfNeeded();
        }
        await this.page.locator('#jforms_view_edition_liz_future_action').selectOption(futureAction);
        await submit.click();
        if (futureAction === 'close'){
            await expect(this.page.locator('#edition-form-container')).toBeHidden();
        } else {
            await expect(this.page.locator('#edition-form-container')).toBeVisible();
        }
        if(futureAction == 'close') {
            await expect(this.page.locator('#lizmap-edition-message')).toBeVisible();
        }
    }

    /**
     * checkEditionFormTextField function
     * check the given text input or text widget value
     * @param {string} fieldName The name of the input/text widget field
     * @param {string} fieldValue The expected field/text widget value
     * @param {null|string} labelText The label text, optional if only input value should be checked
     * @param {boolean} trim trim the text widget value (only for text widget checks)
     */
    async checkEditionFormTextField(fieldName, fieldValue, labelText = null, trim = false){
        if (labelText !== null) {
            await expect(this.editionForm.locator(`label[id='jforms_view_edition_${fieldName}_label']`))
                .toHaveText(labelText);
        }
        const input = this.editionForm.locator(`input[id='jforms_view_edition_${fieldName}']`);
        let value;
        if (trim) {
            value = (await input.inputValue()).replace(/\s+/g,' ').trim();
        } else {
            value = await input.inputValue();
        }

        expect(value).toBe(fieldValue);
    }

    /**
     * fillEditionFormTextInput function
     * fills the given text input with the given text value
     * @param {string} inputName The name of the input field
     * @param {string} value The value to be filled
     */
    async fillEditionFormTextInput(inputName ,value){
        await this.editionForm.locator(`input[id='jforms_view_edition_${inputName}']`).fill(value);
    }

    /**
     * openEditingFormWithLayer function
     * Open the editing panel with the given layer name form to add a feature
     * and return the request generated by the opening of the form
     * @param {string} layer Name of the layer
     * @returns {Promise<Request>} the request that was made to open the editing form
     */
    async openEditingFormWithLayer(layer){
        // Open editing panel
        if (!await this.page.locator('#edition').isVisible()) {
            await this.buttonEditing.click();
        }

        // Move mouse over the layer selector
        await this.page.locator('#edition-layer').hover();

        // Select the layer to edit: add feature
        await this.page.locator('#edition-layer').selectOption({ label: layer });

        // Create the promise to wait for the request to open the form
        const editFeaturePromise = this.page.waitForRequest(/lizmap\/edition\/editFeature/);

        // Click on the draw button to open the form
        await this.page.locator('a#edition-draw').click();

        // Wait for the request to be made and return it
        return await editFeaturePromise;
    }

    /**
     * Identify content locator, for a given feature ID and layer ID if necessary
     * @param {string} featureId Feature ID, optional
     * @param {string} layerId Layer ID, optional
     * @returns {Promise<Locator>} Locator for HTML identify content
     */
    async identifyContentLocator(featureId = '', layerId= '') {
        let selector = `div.lizmapPopupSingleFeature`;
        if (featureId) {
            selector +=`[data-feature-id="${featureId}"]`;
        }
        if (layerId) {
            selector += `[data-layer-id="${layerId}"]`;
        }
        return this.popupContent.locator(selector);
    }

    /**
     * Close left dock
     */
    async closeLeftDock() {
        await this.page.locator('#dock-close').click();
    }

    /**
     * Checks group popup by layers component table and returns table rows
     * @param {object[]} expectedResults array of expected values for each group
     * @returns {Promise<Locator>}
     */
    async checkGroupPopupByLayersGroups(expectedResults){
        await expect(this.page.locator('lizmap-group-popup-layer')).toHaveCount(1);
        let groups = this.page.locator('lizmap-group-popup-layer .lizmap-gpl-table tr');

        await expect(groups).toHaveCount(expectedResults.length);
        for (let i=0; i< expectedResults.length; i++) {
            await expect(groups.nth(i).locator('td').nth(0)).toHaveText(expectedResults[i].name);
            await expect(groups.nth(i).locator('td').nth(1)).toHaveText(`(${expectedResults[i].count})`);
        }

        return groups;
    }

    /**
     * Checks the group popup by layers component single feature interface
     * @param {number} backItemLength "Back to layers list" selector expected length
     * @param {number} counterLength Counter selector expected length
     * @param {string} counterText Counter selector expected text
     * @param {number} navButtonsLength Nav buttons selector expected length
     * @returns {Promise<void>}
     */
    async checkGroupPopupByLayersFeatures(backItemLength, counterLength, counterText, navButtonsLength){
        await expect(this.page.locator('lizmap-group-popup-layer .gpl-back')).toHaveCount(backItemLength);
        await expect(this.page.locator('lizmap-group-popup-layer .gpl-counter')).toHaveCount(counterLength);
        if(counterText) {
            await expect(this.page.locator('lizmap-group-popup-layer .gpl-counter')).toHaveText(counterText);
        }
        await expect(this.page.locator('lizmap-group-popup-layer .gpl-nav-buttons button')).toHaveCount(navButtonsLength);
    }

    /**
     * Group popup by layers: navigate features list back/forth based on direction parameter
     * @param {string} direction possible values are 'next' or 'prev', default 'next'
     */
    async groupPopupByLayersSwitchFeature(direction = 'next'){
        await this.page.locator(`lizmap-group-popup-layer .gpl-${direction}-popup`).click();
    }

    /**
     * Group popup by layers: back to layers list
     * @returns {Promise<void>}
     */
    async groupPopupByLayersBackToList(){
        await this.page.locator('lizmap-group-popup-layer .gpl-back').click();
    }

    /**
     * Returns first level popup single features
     * @param {boolean} groupPopupByLayer
     * @returns {Promise<Locator>}
     */
    async getPopupSingleFeatures(groupPopupByLayer = false){
        const singleFeaturesSelector = `${groupPopupByLayer ? 'lizmap-group-popup-layer div[slot="popup"]':'.lizmapPopupContent'} > .lizmapPopupSingleFeature`;
        return this.page.locator(singleFeaturesSelector);
    }

    /**
     * clickOnMap function
     * Click on the map at the given position
     * @param {number} x Position X on the map
     * @param {number} y Position Y on the map
     */
    async clickOnMap(x, y){
        await this.map.click({position: {x: x, y: y}});
    }

    /**
     * dblClickOnMap function
     * Double click on the map at the given position
     * @param {number} x Position X on the map
     * @param {number} y Position Y on the map
     */
    async dblClickOnMap(x, y){
        await this.map.dblclick({position: {x: x, y: y}});
    }

    /**
     * clickOnMapLegacy function
     * Click on the OL 2map at the given position
     * @param {number} x Position X on the map
     * @param {number} y Position Y on the map
     */
    async clickOnMapLegacy(x, y){
        await this.mapOl2.click({position: {x: x, y: y}});
    }

    /**
     * dblClickOnMapLegacy function
     * Double click on the OL 2map at the given position
     * @param {number} x Position X on the map
     * @param {number} y Position Y on the map
     */
    async dblClickOnMapLegacy(x, y){
        await this.mapOl2.dblclick({position: {x: x, y: y}});
    }

    /**
     * Open permalink UI panel
     * @returns {Promise<void>}
     */
    async openPermalinkPanel(){
        await this.page.locator('#button-permaLink').click();
    }

    /**
     * Checks stored permalink object
     * @param {object} expectedPermalink Permalink values to check
     * @returns {Promise<void>}
     */
    async checkShortLinkPermalink(expectedPermalink){
        const permalink = await this.page.evaluate(() => localStorage.getItem('lizmap_p_link'));
        expect(permalink).not.toBe(null);
        const permalinkJSON = JSON.parse(permalink);
        expect(permalinkJSON).not.toBe(null);
        console.log(permalinkJSON[0].plink.bbox);
        expect(permalinkJSON).toHaveLength(1);
        expect(permalinkJSON[0]).toHaveProperty('repository', expectedPermalink.repository);
        expect(permalinkJSON[0]).toHaveProperty('project', expectedPermalink.project);
        expect(permalinkJSON[0]).toHaveProperty('plink');
        expect(permalinkJSON[0].plink).toHaveProperty('bbox');
        expect(permalinkJSON[0].plink.bbox.join(',')).toMatch(expectedPermalink.bbox);
        expect(permalinkJSON[0].plink).toHaveProperty('layers');
        expect(permalinkJSON[0].plink.layers.join(',')).toBe(expectedPermalink.layers);
        expect(permalinkJSON[0].plink).toHaveProperty('opacities');
        expect(permalinkJSON[0].plink.opacities.join(',')).toBe(expectedPermalink.opacities);
        expect(permalinkJSON[0].plink).toHaveProperty('styles');
        expect(permalinkJSON[0].plink.styles.join(',')).toBe(expectedPermalink.styles);
    }

    /**
     * Checks permalink history table record
     * @param {string} hash Permalink hash
     * @returns {Promise<void>}
     */
    async inspectPermalinkHistoryTableRecord(hash){
        expect(this.page.locator(`#permalink-history table tr[data-share="${hash}"]`)).toHaveCount(1);
        const tds = this.page.locator(`#permalink-history table tr[data-share="${hash}"] td`);
        expect(tds).toHaveCount(4);
        expect(await tds.nth(0).textContent()).toBe(hash);
        expect(tds.nth(1)).toBeVisible();
        expect(tds.nth(2)).toBeVisible();
        expect(tds.nth(3)).toBeVisible();
    }

    /**
     * Checks permalink copy to clipboard functionality
     * @param {string} hash Permalink hash
     * @returns {Promise<void>}
     */
    async copyPermalinkToClipboard(hash){
        const td = this.page.locator(`#permalink-history table tr[data-share="${hash}"] td`).nth(2);
        await td.locator('i').click()
        const clipboardContent = await this.page.evaluate(() => navigator.clipboard.readText());
        const check_url = `http://localhost:8130/index.php/view/map?repository=${this.repository}&project=${this.project}#permalink=${hash}`;
        expect(clipboardContent).toBe(check_url);
    }

    /**
     * Checks permalink share UI panel
     * @param {string} hash Permalink hash
     * @returns {Promise<void>}
     */
    async inspectPermalinkSharePanel(hash){
        await this.page.locator(`#permalink-history table tr[data-share="${hash}"] td`).nth(3).click();

        expect(this.page.locator('#permalink-back')).toBeVisible();
        const check_url = `http://localhost:8130/index.php/view/map?repository=${this.repository}&project=${this.project}#permalink=${hash}`;
        expect(this.page.locator('#input-share-permalink')).toHaveValue(check_url);

        await this.page.locator('#permalink-box [data-bs-target="#tab-embed-permalink"]').click();
        expect(this.page.locator('#input-embed-permalink')).toBeVisible();
        let embed_value = await this.page.locator('#input-embed-permalink').inputValue();

        expect(embed_value.indexOf('width="400"')).toBeGreaterThan(-1);
        expect(embed_value.indexOf('height="300"')).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`repository=${this.repository}`)).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`project=${this.project}`)).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`#permalink=${hash}"`)).toBeGreaterThan(-1);

        // change iframe size
        await this.page.locator('#select-embed-permalink').selectOption('m');

        embed_value = await this.page.locator('#input-embed-permalink').inputValue();

        expect(embed_value.indexOf('width="600"')).toBeGreaterThan(-1);
        expect(embed_value.indexOf('height="450"')).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`repository=${this.repository}`)).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`project=${this.project}`)).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`#permalink=${hash}"`)).toBeGreaterThan(-1);

        await this.page.locator('#select-embed-permalink').selectOption('l');

        embed_value = await this.page.locator('#input-embed-permalink').inputValue();

        expect(embed_value.indexOf('width="800"')).toBeGreaterThan(-1);
        expect(embed_value.indexOf('height="600"')).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`repository=${this.repository}`)).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`project=${this.project}`)).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`#permalink=${hash}"`)).toBeGreaterThan(-1);

        await this.page.locator('#select-embed-permalink').selectOption('p');
        await this.page.locator('#input-embed-width-permalink').fill('250');
        await this.page.locator('#input-embed-height-permalink').fill('367');
        embed_value = await this.page.locator('#input-embed-permalink').inputValue();

        expect(embed_value.indexOf('width="250"')).toBeGreaterThan(-1);
        expect(embed_value.indexOf('height="367"')).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`repository=${this.repository}`)).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`project=${this.project}`)).toBeGreaterThan(-1);
        expect(embed_value.indexOf(`#permalink=${hash}"`)).toBeGreaterThan(-1);
        await this.page.locator('#input-embed-width-permalink').fill('800');
        await this.page.locator('#input-embed-height-permalink').fill('600');

        await this.page.locator('#select-embed-permalink').selectOption('s');

        // back to permalink history
        await this.page.locator('#permalink-back').click();
    }
}
