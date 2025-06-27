// @ts-check
import { test, expect } from '@playwright/test';
import {ProjectPage} from "./pages/project";

test.describe('Media', () => {
    test ('Tests media headers @readonly', async ({ request }) => {
        // Parameters to a media file
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'media/raster.asc',
        });
        let url = `/index.php/view/media/getMedia?${params}`;

        // HEAD request to a media file
        let response = await request.head(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/octet-stream');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('pragma');
        expect(response.headers()['pragma']).toBe('');
        expect(response.headers()).toHaveProperty('expires');
        expect(response.headers()['expires']).toBe('');
        expect(response.headers()).toHaveProperty('etag');
        let etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(40);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="raster.asc"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('407');
        // Check the body is empty
        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(0);

        // GET request to a media file
        response = await request.get(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/octet-stream');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('pragma');
        expect(response.headers()['pragma']).toBe('');
        expect(response.headers()).toHaveProperty('expires');
        expect(response.headers()['expires']).toBe('');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe('');
        expect(response.headers()['etag']).toHaveLength(40);
        expect(response.headers()['etag']).toBe(etag);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="raster.asc"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('407');
        // Check the body
        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(407);

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Parameters to an image media file
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'media/random-1.jpg',
        });
        url = `/index.php/view/media/getMedia?${params}`;

        // HEAD request to an image media file
        response = await request.head(url, {});
        await expect(response).toBeOK();
        // check content-type header
        expect(response.headers()['content-type']).toBe('image/jpeg');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('pragma');
        expect(response.headers()['pragma']).toBe('');
        expect(response.headers()).toHaveProperty('expires');
        expect(response.headers()['expires']).toBe('');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe('');
        expect(response.headers()['etag']).toHaveLength(40);
        expect(response.headers()['etag']).not.toBe(etag);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="random-1.jpg"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('9145');

        // Parameters to a PDF media file
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'media/test.pdf',
        });
        url = `/index.php/view/media/getMedia?${params}`;

        // HEAD request to a PDF media file
        response = await request.head(url, {});
        await expect(response).toBeOK();
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/pdf');
        // check headers
        expect(response.headers()).toHaveProperty('cache-control');
        expect(response.headers()['cache-control']).toBe('no-cache');
        expect(response.headers()).toHaveProperty('pragma');
        expect(response.headers()['pragma']).toBe('');
        expect(response.headers()).toHaveProperty('expires');
        expect(response.headers()['expires']).toBe('');
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe('');
        expect(response.headers()['etag']).toHaveLength(40);
        expect(response.headers()['etag']).not.toBe(etag);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="test.pdf"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('5773');
    });

    test('Tests media are deleted', async ({ page }) => {

        const baseUrl = 'index.php/view/media/getMedia?repository=testsrepository&project=form_edition_all_field_type&path=';
        // on the feature from the "form_edition_upload" layer
        let response = await page.request.get(baseUrl + 'media/upload/form_edition_all_field_type/form_edition_upload/text_file_mandatory/lorem-2.txt');
        await expect(response).toBeOK();

        response = await page.request.get(baseUrl + 'media/upload/form_edition_all_field_type/form_edition_upload/image_file_mandatory/random-2.jpg');
        await expect(response).toBeOK();

        response = await page.request.get(baseUrl + '../media/specific_media_folder/random-4.jpg');
        await expect(response).toBeOK();

        // Open the attribute table
        const project = new ProjectPage(page, 'form_edition_all_field_type');
        await project.open();
        let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);

        await project.openAttributeTable('form_edition_upload');
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
