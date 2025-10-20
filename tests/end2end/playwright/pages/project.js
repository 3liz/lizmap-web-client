// @ts-check
import { expect } from '@playwright/test';
import { gotoMap, qgsTestFile } from '../globals';
import { BasePage } from './base';

/**
 * Playwright Page
 * @typedef {import('@playwright/test').Page} Page
 */

/**
 * Playwright Page
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

    // Menu
    /**
     * Layer switcher menu
     * @type {Locator}
     */
    switcher;
    /**
     * Base layer select
     * @type {Locator}
     */
    baseLayerSelect;
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
     * Popup dock
     * @type {Locator}
     */
    popupContent;
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
        this.dock = page.locator('#dock');
        this.rightDock = page.locator('#right-dock');
        this.bottomDock = page.locator('#bottom-dock');
        this.miniDock = page.locator('#mini-dock-content');
        this.popupContent = page.locator('#popupcontent');
        this.warningMessage = page.locator('#lizmap-warning-message');
        this.search = page.locator('#search-query');
        this.switcher = page.locator('#button-switcher');
        this.baseLayerSelect = page.locator('#switcher-baselayer').getByRole('combobox')
        this.buttonEditing = page.locator('#button-edition');
        this.buttonMetadata = page.locator('#button-metadata');
        this.editionForm = page.locator('#jforms_view_edition');
    }

    /**
     * Waits for a GetMap request
     * @returns {Promise<Request>} The GetMap request
     */
    async waitForGetMapRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'GET' &&
            request.url().includes('WMS') === true &&
            request.url().includes('GetMap') === true
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
     * @returns {Promise<Request>} The GetFeature request
     */
    async waitForGetFeatureRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('WFS') === true &&
            request.postData()?.includes('GetFeature') === true
        );
    }

    /**
     * Waits for a GetPlot request
     * @returns {Promise<Request>} The GetFeature request
     */
    async waitForGetPlotRequest() {
        return this.page.waitForRequest(
            request => request.method() === 'POST' &&
            request.postData()?.includes('getPlot') === true
        );
    }

    /**
     * open function
     * Open the URL for the given project and repository
     * @param {boolean} skip_plugin_update_warning Skip UI warning about QGIS plugin version, false by default.
     */
    async open(skip_plugin_update_warning = false){
        // By default, do not display warnings about old QGIS plugin or outdated Action JSON file
        await this.openWithExtraParams({skip_plugin_update_warning: skip_plugin_update_warning});
    }

    /**
     * Open the URL for the given project and repository with extra parameters
     * @param {object} params Parameters to add to the default repository and project parameters.
     * Example: {skip_plugin_update_warning: true}
     * @returns {Promise<void>}
     */
    async openWithExtraParams(params){
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
            `/index.php/view/map?${searchParams.toString()}`,
            this.page,
            this.mapMustLoad,
            this.layersInTreeView,
            this.waitForGetLegendGraphicDuringLoad,
        );

        await expect(await this.hasDebugBarErrors(), (await this.getDebugBarErrorsMessage())).toBe(false);
        await expect(await this.hasDebugBarWarnings(), (await this.getDebugBarWarningMessage())).toBe(false);
    }

    /**
     * openAttributeTable function
     * Open the attribute table for the given layer
     * @param {string} layer Name of the layer
     * @param {boolean} maximise If the attribute table must be maximised
     */
    async openAttributeTable(layer, maximise = false){
        await this.page.locator('a#button-attributeLayers').click();
        if (maximise) {
            await this.page.getByRole('button', { name: 'Maximize' }).click();
        }
        await this.page.locator('#attribute-layer-list-table').locator(`button[value=${layer}]`).click();
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
     * launchExport function
     * @param {string} layer     - the layer to export
     * @param {string} format - the format to export
     * @returns {Promise<Request>} the request generated by the export
     */
    async launchExport(layer, format){
        const getFeatureRequestPromise = this.page.waitForRequest(
            request => request.method() === 'POST'
            && request.postData() != null
            && request.postData()?.includes('GetFeature') === true
        );
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
        await this.page.locator('#jforms_view_edition_liz_future_action').selectOption(futureAction);
        await this.editingSubmit('submit').click();
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
        await this.buttonEditing.click();

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
}
