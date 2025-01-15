import {expect, type Locator, type Page} from '@playwright/test';
import { gotoMap } from '../globals';

export class ProjectPage {
    readonly page: Page;
    // Metadata
    readonly project: string;
    readonly repository: string;

    // Menu
    readonly switcher: Locator;
    readonly buttonEditing: Locator;

    // Docks
    readonly attributeTable: Locator;
    readonly dock: Locator;
    readonly rightDock: Locator;
    readonly bottomDock: Locator;
    readonly miniDock: Locator;

    readonly search: Locator;

    // Messages
    readonly warningMessage: Locator;

    // Attribute table for the given layer name
    readonly attributeTableHtml = (name: string) =>
        this.page.locator(`#attribute-layer-table-${name}`);

    constructor(page: Page, project: string) {
        this.page = page;
        this.project = project;
        this.repository = 'testsrepository';
        this.dock = page.locator('#dock');
        this.rightDock = page.locator('#right-dock');
        this.bottomDock = page.locator('#bottom-dock');
        this.miniDock = page.locator('#mini-dock-content');
        this.warningMessage = page.locator('#lizmap-warning-message');
        this.search = page.locator('#search-query');
        this.switcher = page.locator('#button-switcher');
        this.buttonEditing = page.locator('#button-edition');
    }

    /**
     * open function
     * Open the project
     */
    async open(){
        await gotoMap(`/index.php/view/map?repository=${this.repository}&project=${this.project}`, this.page);
    }

    /**
     * openAttributeTable function
     * Open the attribute table for the given layer
     * @param {string} layer Name of the layer
     * @param {boolean} maximise If the attribute table must be maximised
     */
    async openAttributeTable(layer: string, maximise: boolean = false){
        await this.page.locator('a#button-attributeLayers').click();
        if (maximise) {
            await this.page.getByRole('button', { name: 'Maximize' }).click();
        }
        await this.page.locator('#attribute-layer-list-table').locator(`button[value=${layer}]`).click();
    }

    /**
     * editingSubmitForm function
     * Submit the form
     * @param {string} futureAction The action to do after submit : can be close/create/edit.
     */
    async editingSubmitForm(futureAction: string = 'close'){
        await this.page.locator('#jforms_view_edition_liz_future_action').selectOption(futureAction);
        await this.page.locator('#jforms_view_edition__submit_submit').click();
        if (futureAction == 'close'){
            await expect(this.page.locator('#edition-form-container')).toBeHidden();
        } else {
            await expect(this.page.locator('#edition-form-container')).toBeVisible();
        }
        await expect(this.page.locator('#lizmap-edition-message')).toBeVisible();
    }

    /**
     * openEditingFormWithLayer function
     * Open the editing panel with the given layer name form
     * @param {string} layer Name of the layer
     */
    async openEditingFormWithLayer(layer: string){
        await this.buttonEditing.click();
        await this.page.locator('#edition-layer').selectOption({ label: layer });
        await this.page.locator('a#edition-draw').click();
    }

    /**
     * clickOnMap function
     * Click on the map at the given position
     * @param {number} x Position X on the map
     * @param {number} y Position Y on the map
     */
    async clickOnMap(x: number, y: number){
        await this.page.locator('#newOlMap').click({
            position: {
                x: x,
                y: y
            }
        });
    }
}
