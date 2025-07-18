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

    test ('Tests media errors @readonly', async ({ request }) => {
        // Parameters with unknown repository
        let params = new URLSearchParams({
            repository: 'unknown',
            project: 'form_edition_all_field_type',
            path: 'media/raster.asc',
        });
        let url = `/index.php/view/media/getMedia?${params}`;

        // GET request
        let response = await request.get(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(404);
        expect(response.statusText()).toBe('Not Found');
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check body
        let body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body['error']).toBe('404 not found (wrong action)');
        expect(body).toHaveProperty('message');

        // Parameters with unknown project
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'unknown',
            path: 'media/raster.asc',
        });
        url = `/index.php/view/media/getMedia?${params}`;

        // GET request
        response = await request.get(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(404);
        expect(response.statusText()).toBe('Not Found');
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check body
        body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body['error']).toBe('404 not found (wrong action)');
        expect(body).toHaveProperty('message');

        // Parameters with unknown file
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'media/unknown.asc',
        });
        url = `/index.php/view/media/getMedia?${params}`;

        // GET request
        response = await request.get(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(404);
        expect(response.statusText()).toBe('Not Found');
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check body
        body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body['error']).toBe('404 not found (wrong action)');
        expect(body).toHaveProperty('message');

        // Parameters with known file not in media
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'world-3857.qgs.jpg',
        });
        url = `/index.php/view/media/getMedia?${params}`;

        // GET request
        response = await request.get(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(404);
        expect(response.statusText()).toBe('Not Found');
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check body
        body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body['error']).toBe('404 not found (wrong action)');
        expect(body).toHaveProperty('message');

        // Parameters without any error
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'media/raster.asc',
        });
        url = `/index.php/view/media/getMedia?${params}`;

        // POST request not allowed
        response = await request.post(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(405);
        expect(response.statusText()).toBe('Method Not Allowed');
        // check content-type header
        expect(response.headers()['content-type']).toContain('text/plain');
        // check headers
        expect(response.headers()).toHaveProperty('allow');
        expect(response.headers()['allow']).toBe('GET, HEAD');
    });

    test ('Tests illustration headers @readonly', async ({ request }) => {
        // Parameters for the request to a project with illustration
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'world-3857',
        });
        let url = `/index.php/view/media/illustration?${params}`;

        // HEAD request to get headers without body
        let response = await request.head(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
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
        let etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(40);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="testsrepository_world-3857.jpg"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('20463');
        // Check the body is empty
        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(0);

        // GET request to get the file
        response = await request.get(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
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
        expect(response.headers()['etag']).toBe(etag);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="testsrepository_world-3857.jpg"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('20463');
        // Check the body
        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(20463);

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Parameters to an other project with illustration
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'world-4326',
        });
        url = `/index.php/view/media/illustration?${params}`;

        // HEAD request
        response = await request.head(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
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
        expect(response.headers()['content-disposition']).toBe('inline; filename="testsrepository_world-4326.jpg"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('27475');
    });

    test ('Tests illustration errors @readonly', async ({ request }) => {
        // Parameters with unknown repository
        let params = new URLSearchParams({
            repository: 'unknown',
            project: 'world-3857',
        });
        let url = `/index.php/view/media/illustration?${params}`;

        // GET request
        let response = await request.get(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(404);
        expect(response.statusText()).toBe('Not Found');
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check body
        let body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body['error']).toBe('404 not found (wrong action)');
        expect(body).toHaveProperty('message');

        // Parameters with unknown project
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'unknown',
        });
        url = `/index.php/view/media/illustration?${params}`;

        // GET request
        response = await request.get(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(404);
        expect(response.statusText()).toBe('Not Found');
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/json');
        // check body
        body = await response.json();
        expect(body).toHaveProperty('error');
        expect(body['error']).toBe('404 not found (wrong action)');
        expect(body).toHaveProperty('message');

        // Parameters without any error
        params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
        });
        url = `/index.php/view/media/illustration?${params}`;

        // POST request not allowed
        response = await request.post(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(405);
        expect(response.statusText()).toBe('Method Not Allowed');
        // check content-type header
        expect(response.headers()['content-type']).toContain('text/plain');
        // check headers
        expect(response.headers()).toHaveProperty('allow');
        expect(response.headers()['allow']).toBe('GET, HEAD');
    });

    test ('Tests default illustration headers @readonly', async ({ request }) => {
        // default illustration image
        let url = `/index.php/view/media/defaultIllustration`;

        // HEAD request to get headers without body
        let response = await request.head(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
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
        let etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(40);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="lizmap_mappemonde.jpg"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('9815');
        // Check the body is empty
        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(0);

        // GET request to get the file
        response = await request.get(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
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
        expect(response.headers()['etag']).toBe(etag);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="lizmap_mappemonde.jpg"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('9815');
        // Check the body
        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(9815);

        // GET request with the etag
        response = await request.get(url, {
            headers: {
                'If-None-Match': etag
            }
        });
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(304);

        // Parameters to a project without illustration
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
        });
        url = `/index.php/view/media/illustration?${params}`;

        // GET request
        response = await request.head(url, {});
        await expect(response).toBeOK();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('image/jpeg');
        // check headers
        expect(response.headers()).toHaveProperty('etag');
        expect(response.headers()['etag']).not.toBe('');
        expect(response.headers()['etag']).toHaveLength(40);
        expect(response.headers()['etag']).toBe(etag);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="lizmap_mappemonde.jpg"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('9815');
    });

    test ('Tests default illustration errors @readonly', async ({ request }) => {
        let url = `/index.php/view/media/defaultIllustration`;

        // POST request not allowed
        let response = await request.post(url, {});
        await expect(response).not.toBeOK();
        expect(response.status()).toBe(405);
        expect(response.statusText()).toBe('Method Not Allowed');
        // check content-type header
        expect(response.headers()['content-type']).toContain('text/plain');
        // check headers
        expect(response.headers()).toHaveProperty('allow');
        expect(response.headers()['allow']).toBe('GET, HEAD');
    })

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

    });

    test('Range requests @readonly', async ({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'media/raster.asc',
        });
        let url = `/index.php/view/media/getMedia?${params}`;
        let response = await request.head(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/octet-stream');
        // check headers
        expect(response.headers()).toHaveProperty('etag');
        let etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(40);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="raster.asc"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('407');
        expect(response.headers()).toHaveProperty('accept-ranges');
        expect(response.headers()['accept-ranges']).toBe('bytes');

        // From 0 to 100
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=0-100',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(206);
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
        expect(response.headers()['content-length']).toBe('101');
        expect(response.headers()).toHaveProperty('content-range');
        expect(response.headers()['content-range']).toBe('bytes 0-100/407');

        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(101);

        // From 201 to 300
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=201-300',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(206);
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
        expect(response.headers()['content-length']).toBe('100');
        expect(response.headers()).toHaveProperty('content-range');
        expect(response.headers()['content-range']).toBe('bytes 201-300/407');

        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(100);

        // get last 100 bytes
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=-100',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(206);
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
        expect(response.headers()['content-length']).toBe('100');
        expect(response.headers()).toHaveProperty('content-range');
        expect(response.headers()['content-range']).toBe('bytes 307-406/407');

        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(100);

        // Get the last bytes from 306
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=306-',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(206);
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
        expect(response.headers()['content-length']).toBe('101');
        expect(response.headers()).toHaveProperty('content-range');
        expect(response.headers()['content-range']).toBe('bytes 306-406/407');

        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(101);

        // Get 1 byte
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=210-210',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(206);
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
        expect(response.headers()['content-length']).toBe('1');
        expect(response.headers()).toHaveProperty('content-range');
        expect(response.headers()['content-range']).toBe('bytes 210-210/407');

        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(1);
    });

    test('Range requests if-range @readonly', async ({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'media/raster.asc',
        });
        let url = `/index.php/view/media/getMedia?${params}`;
        let response = await request.head(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/octet-stream');
        // check headers
        expect(response.headers()).toHaveProperty('etag');
        let etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(40);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="raster.asc"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('407');
        expect(response.headers()).toHaveProperty('accept-ranges');
        expect(response.headers()['accept-ranges']).toBe('bytes');

        // From 0 to 99 with valid if-range header
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=0-99',
                'If-Range': etag,
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(206);
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
        expect(response.headers()['content-length']).toBe('100');
        expect(response.headers()).toHaveProperty('content-range');
        expect(response.headers()['content-range']).toBe('bytes 0-99/407');

        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(100);

        // From 0 to 99 with invalid if-range header
        // Get the full file
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=0-99',
                'If-Range': 'foo-bar',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
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

        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(407);
    });

    test('Range requests errors @readonly', async ({ request }) => {
        let params = new URLSearchParams({
            repository: 'testsrepository',
            project: 'form_edition_all_field_type',
            path: 'media/raster.asc',
        });
        let url = `/index.php/view/media/getMedia?${params}`;
        let response = await request.head(url, {});
        // check response
        expect(response.ok()).toBeTruthy();
        expect(response.status()).toBe(200);
        // check content-type header
        expect(response.headers()['content-type']).toBe('application/octet-stream');
        // check headers
        expect(response.headers()).toHaveProperty('etag');
        let etag = response.headers()['etag'];
        expect(etag).not.toBe('');
        expect(etag).toHaveLength(40);
        expect(response.headers()).toHaveProperty('content-disposition');
        expect(response.headers()['content-disposition']).toBe('inline; filename="raster.asc"');
        expect(response.headers()).toHaveProperty('content-length');
        expect(response.headers()['content-length']).toBe('407');
        expect(response.headers()).toHaveProperty('accept-ranges');
        expect(response.headers()['accept-ranges']).toBe('bytes');

        // Get bytes outside file
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=500-600',
            }
        });
        // check response
        expect(response.ok()).not.toBeTruthy();
        expect(response.status()).toBe(416);
        expect(response.headers()).toHaveProperty('content-range');
        expect(response.headers()['content-range']).toBe('bytes */407');

        // Get not valid bytes order
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=210-209',
            }
        });
        // check response
        expect(response.ok()).not.toBeTruthy();
        expect(response.status()).toBe(416);
        expect(response.headers()).toHaveProperty('content-range');
        expect(response.headers()['content-range']).toBe('bytes */407');

        // If Range header is not well formed, the server should return the full file
        response = await request.get(url, {
            headers: {
                'Range': 'bytes=foo-bar',
            }
        });
        // check response
        expect(response.ok()).toBeTruthy();
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

        expect(await response.body()).toBeInstanceOf(Buffer);
        expect((await response.body()).length).toBe(407);
    });
})
