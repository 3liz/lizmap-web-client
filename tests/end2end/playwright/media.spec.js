// @ts-check
import { test, expect } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Media', () => {
    test('Tests media are deleted', async ({ page }) => {

        var baseUrl = 'index.php/view/media/getMedia?repository=testsrepository&project=form_edition_all_field_type&path=';
        // on the feature from the "form_edition_upload" layer
        var response = await page.request.get(baseUrl + 'media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt');
        await expect(response).toBeOK();

        var response = await page.request.get(baseUrl + 'media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg');
        await expect(response).toBeOK();

        var response = await page.request.get(baseUrl + '../media/specific_media_folder/random-4.jpg');
        await expect(response).toBeOK();

        // Open the attribute table
        const url = '/index.php/view/map?repository=testsrepository&project=form_edition_all_field_type';
        await gotoMap(url, page);

        await page.locator('#button-attributeLayers').click();

        let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);

        await page.locator('#attribute-layer-list button[value="form_edition_upload"]').click();
        await getFeatureRequestPromise;

        await page.getByRole('row', { name: '2 text_file_mandatory' }).getByRole('button').nth(2);

//        var response = await page.request.get(baseUrl + 'media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt');
//        await expect(response).toBeOK();
//
//        var response = await page.request.get(baseUrl + 'media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg');
//        await expect(response).toBeFalsy();
//
//        var response = await page.request.get(baseUrl + '../media/specific_media_folder/random-4.jpg');
//        await expect(response).toBeFalsy();

    })
})
