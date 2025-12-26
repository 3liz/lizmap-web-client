import { test, expect } from '@playwright/test';
import { ProjectPage } from './pages/project';
import { expect as requestExpect } from './fixtures/expect-request.js'
import { expect as responseExpect } from './fixtures/expect-response.js'

const tableName = 'point';

/**
 * @typedef {object} Position
 * @property {number} x coord x in pixel in the page
 * @property {number} y coord y in pixel in the page
 */

/**
 * Move the map from a position to another
 * @param {ProjectPage} project the project page
 * @param {Position} from the start position
 * @param {Position} to the end position
 */
const moveEdition = async (project, from, to) => {
    await project.mapOl2.hover()
    await project.page.mouse.move(from.x, from.y)
    await project.page.mouse.down()
    await project.page.waitForTimeout(10)

    const distX = to.x-from.x;
    const distY = to.y-from.y;
    const steps = Math.max(Math.abs(distX), Math.abs(distY));
    let step = 0;
    while (step < steps) {
        step += 1;
        await project.page.mouse.move(
            Math.floor(from.x + (distX * step / steps)),
            Math.floor(from.y + (distY * step / steps)),
        );
        await project.page.waitForTimeout(10);
    }

    await project.page.mouse.move(to.x, to.y)
    await project.page.waitForTimeout(10)
    await project.page.mouse.up()
    await project.mapOl2.hover()
}

test.describe('Form edition all field type', function () {

    test.beforeEach(async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_value_relation_field');
        await project.open();

        const formRequest = await project.openEditingFormWithLayer(tableName);
        await formRequest.response();
    });

    test('Check initial states @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_value_relation_field');

        await expect(page.locator('#edition')).toBeVisible();
        await expect(page.locator('#edition .edition-tabs')).toBeVisible();
        await expect(page.locator('#edition-form-container')).toBeVisible();

        // The id field must be an input number
        let fieldLocator = project.editingField('id');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('INPUT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_id');
        await expect(fieldLocator).toHaveAttribute('name', 'id');
        await expect(fieldLocator).toHaveAttribute('type', 'number');
        await expect(fieldLocator).toHaveAttribute('step', 'any');
        await expect(fieldLocator).not.toHaveAttribute('min');
        await expect(fieldLocator).not.toHaveAttribute('max');
        await expect(fieldLocator).toContainClass('jforms-ctrl-input');
        await expect(fieldLocator).not.toBeDisabled();

        // No expression menulist 4 values + 1 empty value
        fieldLocator = project.editingField('code_without_exp');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('SELECT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_code_without_exp')
        await expect(fieldLocator).toHaveAttribute('name', 'code_without_exp');
        await expect(fieldLocator).toHaveAttribute('size', '1');
        await expect(fieldLocator).toContainClass('jforms-ctrl-menulist');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator.locator('option')).toHaveCount(5);
        let selectValues = [];
        let selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'A1', 'A2', 'B1', 'B2']);
        expect(selectTitles).toEqual(['', 'Zone A1', 'Zone A2', 'Zone B1', 'Zone B2']);

        // Simple expression menulist 2 values + 1 empty value
        fieldLocator = project.editingField('code_with_simple_exp');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('SELECT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_code_with_simple_exp')
        await expect(fieldLocator).toHaveAttribute('name', 'code_with_simple_exp');
        await expect(fieldLocator).toHaveAttribute('size', '1');
        await expect(fieldLocator).toContainClass('jforms-ctrl-menulist');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator.locator('option')).toHaveCount(3);
        selectValues = [];
        selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'A1', 'B1']);
        expect(selectTitles).toEqual(['', 'Zone A1', 'Zone B1']);

        // Parent field menulist 3 values + 1 empty value
        fieldLocator = project.editingField('code_for_drill_down_exp');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('SELECT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_code_for_drill_down_exp')
        await expect(fieldLocator).toHaveAttribute('name', 'code_for_drill_down_exp');
        await expect(fieldLocator).toHaveAttribute('size', '1');
        await expect(fieldLocator).toContainClass('jforms-ctrl-menulist');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator.locator('option')).toHaveCount(4);
        selectValues = [];
        selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'A', 'B', '{2839923C-8B7D-419E-B84B-CA2FE9B80EC7}']);
        expect(selectTitles).toEqual(['', 'Zone A', 'Zone B', 'No Zone']);

        // Child field menulist 0 value + 1 empty value
        fieldLocator = project.editingField('code_with_drill_down_exp');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('SELECT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_code_with_drill_down_exp')
        await expect(fieldLocator).toHaveAttribute('name', 'code_with_drill_down_exp');
        await expect(fieldLocator).toHaveAttribute('size', '1');
        await expect(fieldLocator).toContainClass('jforms-ctrl-menulist');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator.locator('option')).toHaveCount(1);
        selectValues = [];
        selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['']);
        expect(selectTitles).toEqual(['']);

        // Geom expression menulist 0 value + 1 empty value
        fieldLocator = project.editingField('code_with_geom_exp');
        await expect(fieldLocator).toHaveCount(1);
        await expect(fieldLocator).not.toBeHidden();
        await fieldLocator.scrollIntoViewIfNeeded();
        expect(await fieldLocator.evaluate(elt => elt.tagName)).toBe('SELECT');
        await expect(fieldLocator).toHaveId('jforms_view_edition_code_with_geom_exp')
        await expect(fieldLocator).toHaveAttribute('name', 'code_with_geom_exp');
        await expect(fieldLocator).toHaveAttribute('size', '1');
        await expect(fieldLocator).toContainClass('jforms-ctrl-menulist');
        await expect(fieldLocator).not.toBeDisabled();
        await expect(fieldLocator.locator('option')).toHaveCount(1);
        selectValues = [];
        selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['']);
        expect(selectTitles).toEqual(['']);

        // Close form
        await project.editingSubmit('cancel').scrollIntoViewIfNeeded();
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('Child field menulist after parent select @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_value_relation_field');

        // Intercept getData query to wait for its end
        let getDataRequestPromise = page.waitForRequest(/jelix\/forms\/getdata/);
        // Select A in parent field
        let parentFieldLocator = project.editingField('code_for_drill_down_exp');
        await parentFieldLocator.selectOption('A');
        // Wait for getData query ends, check request parameters and response
        let getDataRequest = await getDataRequestPromise;
        let getDataExpectedParameters = {
            '__ref': 'code_with_drill_down_exp',
            'code_for_drill_down_exp': 'A',
        };
        requestExpect(getDataRequest).toContainParametersInPostData(getDataExpectedParameters);
        responseExpect(await getDataRequest.response()).toBeJson();

        // Child field menulist 2 values + 1 empty value
        let childFieldLocator = project.editingField('code_with_drill_down_exp');
        await expect(childFieldLocator.locator('option')).toHaveCount(3);
        let selectValues = [];
        let selectTitles = [];
        for (const option of await childFieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'A1', 'A2']);
        expect(selectTitles).toEqual(['', 'Zone A1', 'Zone A2']);

        // Select B in parent field
        getDataRequestPromise = page.waitForRequest(/jelix\/forms\/getdata/);
        await parentFieldLocator.selectOption('B');
        // Wait for getData query ends, check request parameters and response
        getDataRequest = await getDataRequestPromise;
        getDataExpectedParameters = {
            '__ref': 'code_with_drill_down_exp',
            'code_for_drill_down_exp': 'B',
        };
        requestExpect(getDataRequest).toContainParametersInPostData(getDataExpectedParameters);
        responseExpect(await getDataRequest.response()).toBeJson();

        await expect(childFieldLocator.locator('option')).toHaveCount(3);
        selectValues = [];
        selectTitles = [];
        for (const option of await childFieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'B1', 'B2']);
        expect(selectTitles).toEqual(['', 'Zone B1', 'Zone B2']);

        // Close form
        await project.editingSubmit('cancel').scrollIntoViewIfNeeded();
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });

    test('Child field menulist after geometry creation @readonly', async function ({ page }) {
        const project = new ProjectPage(page, 'form_edition_value_relation_field');

        // Intercept getData query to wait for its end
        let getDataRequestPromise = page.waitForRequest(/jelix\/forms\/getdata/);
        // Click on the map over Zone A1
        project.clickOnMapLegacy(530-150, 375-50);
        // Wait for getData query ends, check request parameters and response
        let getDataRequest = await getDataRequestPromise;
        let getDataExpectedParameters = {
            '__ref': 'code_with_geom_exp',
            'geom': /^POINT\(\d+\.\d+ \d+\.\d+\)$/,
        };
        requestExpect(getDataRequest).toContainParametersInPostData(getDataExpectedParameters);
        responseExpect(await getDataRequest.response()).toBeJson();

        // Geom expression menulist 1 value + 1 empty value
        let fieldLocator = project.editingField('code_with_geom_exp');
        await expect(fieldLocator.locator('option')).toHaveCount(2);
        let selectValues = [];
        let selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'A1']);
        expect(selectTitles).toEqual(['', 'Zone A1']);


        // Move point to Zone A2
        getDataRequestPromise = page.waitForRequest(/jelix\/forms\/getdata/);
        moveEdition(project, {x: 530-150+30, y: 375-50+75}, {x: 530-50+30, y: 375-50+75});
        getDataRequest = await getDataRequestPromise;
        getDataExpectedParameters = {
            '__ref': 'code_with_geom_exp',
            'geom': /^POINT\(\d+\.\d+ \d+\.\d+\)$/,
        };
        requestExpect(getDataRequest).toContainParametersInPostData(getDataExpectedParameters);
        responseExpect(await getDataRequest.response()).toBeJson();

        await expect(fieldLocator.locator('option')).toHaveCount(2);
        selectValues = [];
        selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'A2']);
        expect(selectTitles).toEqual(['', 'Zone A2']);

        // Move point to Zone B2
        getDataRequestPromise = page.waitForRequest(/jelix\/forms\/getdata/);
        moveEdition(project, {x: 530-50+30, y: 375-50+75}, {x: 530-50+30, y: 375+75});
        getDataRequest = await getDataRequestPromise;
        getDataExpectedParameters = {
            '__ref': 'code_with_geom_exp',
            'geom': /^POINT\(\d+\.\d+ \d+\.\d+\)$/,
        };
        requestExpect(getDataRequest).toContainParametersInPostData(getDataExpectedParameters);
        responseExpect(await getDataRequest.response()).toBeJson();

        await expect(fieldLocator.locator('option')).toHaveCount(2);
        selectValues = [];
        selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'B2']);
        expect(selectTitles).toEqual(['', 'Zone B2']);

        // Move point to Zone B1
        getDataRequestPromise = page.waitForRequest(/jelix\/forms\/getdata/);
        moveEdition(project, {x: 530-50+30, y: 375+75}, {x: 530-150+30, y: 375+75});
        getDataRequest = await getDataRequestPromise;
        getDataExpectedParameters = {
            '__ref': 'code_with_geom_exp',
            'geom': /^POINT\(\d+\.\d+ \d+\.\d+\)$/,
        };
        requestExpect(getDataRequest).toContainParametersInPostData(getDataExpectedParameters);
        responseExpect(await getDataRequest.response()).toBeJson();

        await expect(fieldLocator.locator('option')).toHaveCount(2);
        selectValues = [];
        selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['', 'B1']);
        expect(selectTitles).toEqual(['', 'Zone B1']);


        // Move point to out Zones
        getDataRequestPromise = page.waitForRequest(/jelix\/forms\/getdata/);
        moveEdition(project, {x: 530-150+30, y: 375+75}, {x: 530+100+30, y: 375+75});
        getDataRequest = await getDataRequestPromise;
        getDataExpectedParameters = {
            '__ref': 'code_with_geom_exp',
            'geom': /^POINT\(\d+\.\d+ \d+\.\d+\)$/,
        };
        requestExpect(getDataRequest).toContainParametersInPostData(getDataExpectedParameters);
        responseExpect(await getDataRequest.response()).toBeJson();

        await expect(fieldLocator.locator('option')).toHaveCount(1);
        selectValues = [];
        selectTitles = [];
        for (const option of await fieldLocator.locator('option').all()) {
            selectValues.push(await option.getAttribute('value'));
            selectTitles.push(await option.textContent());
        }
        expect(selectValues).toEqual(['']);
        expect(selectTitles).toEqual(['']);

        // Close form
        await project.editingSubmit('cancel').scrollIntoViewIfNeeded();
        page.once('dialog', dialog => dialog.accept());
        await project.editingSubmit('cancel').click();
    });
});
