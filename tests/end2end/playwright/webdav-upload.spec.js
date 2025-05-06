// @ts-check
import { test, expect } from '@playwright/test';
import { expectParametersToContain, playwrightTestFile } from './globals';
import { ProjectPage } from "./pages/project";

test.describe('WebDAV Server',
    {
        tag:['@write'],
    }, () =>
    {

        test('Upload new file to remote server, inspect attribute table', async ({ page }) => {
            const project = new ProjectPage(page, 'form_upload_webdav');
            await project.open();
            await project.closeLeftDock();

            let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
            await project.openEditingFormWithLayer('form_edition_upload_webdav');
            await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();

            await page.locator('#jforms_view_edition_remote_path').setInputFiles(playwrightTestFile('test_upload_file', 'test_upload_attribute_table.txt'));
            // submit the form

            await project.editingSubmitForm('edit');
            await editFeatureRequestPromise;

            // Wait a bit for the UI to refresh
            await page.waitForTimeout(300);

            await expect(page.locator("div.alert.alert-success")).toBeVisible();

            let id = await page.locator('#jforms_view_edition_id').inputValue();

            let getFeatureRequestPromise = page.waitForRequest(request =>
                request.method() === 'POST'
                && request.postData()?.includes('GetFeature') === true
            );
            await page.locator("#button-attributeLayers").click();
            await page.locator("button[value='form_edition_upload_webdav']").click();
            await getFeatureRequestPromise;

            let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav");
            await expect(attrTable).toHaveCount(1);

            await expect(attrTable.locator("tr[id='" + id + "']")).toHaveCount(1);

            await expect(attrTable.locator("tr[id='" + id + "']").locator("td")).toHaveCount(4);

            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(1)).toHaveText(id);
            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(2)).toHaveText("remote");
            await expect(
                attrTable.locator("tr[id='" + id + "']").locator("td").nth(2).locator("a")
            ).toHaveAttribute(
                "href",
                "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_attribute_table.txt"
            );

        });

        test('Keep same file after reopen form, inspect attribute table', async ({ page }) => {
            const project = new ProjectPage(page, 'form_upload_webdav');
            await project.open();
            await project.closeLeftDock();

            let getFeatureRequestPromise = page.waitForRequest(request =>
                request.method() === 'POST'
                && request.postData()?.includes('GetFeature') === true
            );
            await page.locator("#button-attributeLayers").click();
            await page.locator("button[value='form_edition_upload_webdav_geom']").click();
            await getFeatureRequestPromise;

            let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav_geom");
            await expect(attrTable).toHaveCount(1);
            await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");
            let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
            await attrTable.locator("tr").nth(1).locator("td").nth(0).locator("button[title='Edit']").click();
            await editFeatureRequestPromise;
            await page.waitForTimeout(300);

            await expect(page.locator("#jforms_view_edition_remote_path_jf_action_keep")).toBeChecked()

            let getNewFeatureRequestPromise = page.waitForRequest(request =>
                request.method() === 'POST'
                && request.postData()?.includes('GetFeature') === true
            );

            await project.editingSubmitForm('close');

            await getNewFeatureRequestPromise;

            await page.waitForTimeout(300);

            await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveText("remote");
            await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");

        });

        test('Change file after reopen form, inspect attribute table', async ({ page }) => {
            const project = new ProjectPage(page, 'form_upload_webdav');
            await project.open();
            await project.closeLeftDock();

            let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
            await project.openEditingFormWithLayer('form_edition_upload_webdav');

            await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();
            await page.locator('#jforms_view_edition_remote_path').setInputFiles(playwrightTestFile('test_upload_file','test_upload_attribute_table_keep.txt'));

            // submit the form
            await project.editingSubmitForm('edit');

            await editFeatureRequestPromise;

            await page.waitForTimeout(300);

            await expect(page.locator("div.alert.alert-success")).toBeVisible();

            let id = await page.locator('#jforms_view_edition_id').inputValue();

            let getFeatureRequestPromise = page.waitForRequest(request =>
                request.method() === 'POST'
                && request.postData()?.includes('GetFeature') === true
            );

            await page.locator("#button-attributeLayers").click();
            await page.locator("button[value='form_edition_upload_webdav']").click();
            await getFeatureRequestPromise;

            let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav");
            await expect(attrTable).toHaveCount(1);

            await expect(attrTable.locator("tr[id='" + id + "']")).toHaveCount(1);

            await expect(attrTable.locator("tr[id='" + id + "']").locator("td")).toHaveCount(4);

            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(1)).toHaveText(id);
            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(2)).toHaveText("remote");
            await expect(
                attrTable.locator("tr[id='" + id + "']").locator("td").nth(2).locator("a")
            ).toHaveAttribute(
                "href",
                "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_attribute_table_keep.txt"
            );

            await page.locator("#jforms_view_edition_remote_path_jf_action_new").click();
            await expect(page.locator("#jforms_view_edition_remote_path_jf_action_new")).toBeChecked();

            await page.locator('#jforms_view_edition_remote_path').setInputFiles(playwrightTestFile('test_upload_file','test_upload_replace.txt'));

            await project.editingSubmitForm('close');

            await editFeatureRequestPromise;

            await getFeatureRequestPromise;

            await page.waitForTimeout(300);

            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(1)).toHaveText(id);
            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(2)).toHaveText("remote");
            await expect(
                attrTable.locator("tr[id='" + id + "']").locator("td").nth(2).locator("a")
            ).toHaveAttribute(
                "href",
                "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_replace.txt"
            );

        });

        test('Delete file, inspect attribute table', async ({ page }) => {
            const project = new ProjectPage(page, 'form_upload_webdav');
            await project.open();
            await project.closeLeftDock();

            let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
            await project.openEditingFormWithLayer('form_edition_upload_webdav');
            await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();

            await page.locator('#jforms_view_edition_remote_path').setInputFiles(playwrightTestFile('test_upload_file','test_upload_delete.txt'));
            // submit the form
            await project.editingSubmitForm('edit');
            await editFeatureRequestPromise;

            await page.waitForTimeout(300);

            await expect(page.locator("div.alert.alert-success")).toBeVisible();

            let id = await page.locator('#jforms_view_edition_id').inputValue();

            let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);
            await page.locator("#button-attributeLayers").click();
            await page.locator("button[value='form_edition_upload_webdav']").click();
            await getFeatureRequestPromise;

            let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav");
            await expect(attrTable).toHaveCount(1);

            await expect(attrTable.locator("tr[id='" + id + "']")).toHaveCount(1);

            await expect(attrTable.locator("tr[id='" + id + "']").locator("td")).toHaveCount(4);

            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(1)).toHaveText(id);
            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(2)).toHaveText("remote");
            await expect(
                attrTable.locator("tr[id='" + id + "']").locator("td").nth(2).locator("a")
            ).toHaveAttribute(
                "href",
                "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_delete.txt"
            );

            await page.locator("#jforms_view_edition_remote_path_jf_action_del").click();
            await expect(page.locator("#jforms_view_edition_remote_path_jf_action_del")).toBeChecked();

            await project.editingSubmitForm('close');

            await editFeatureRequestPromise;

            await getFeatureRequestPromise;

            await page.waitForTimeout(300);

            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(1)).toHaveText(id);
            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(2)).toHaveText("");
            await expect(attrTable.locator("tr[id='" + id + "']").locator("td").nth(2).locator("a")).toHaveCount(0);

        });

        test("Inspect popups and attribute table for postgre layers", async ({ page }) => {
            const project = new ProjectPage(page, 'form_upload_webdav');
            await project.open();
            await project.closeLeftDock();

            let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
            await project.clickOnMap(644, 282);

            let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            let layers = [
                'form_edition_upload_webdav_geom',
                'for_edition_upload_webdav_shape',
                'form_edition_upload_webdav_parent_geom',
            ];
            const expectedParameters = {
                'SERVICE': 'WMS',
                'REQUEST': 'GetFeatureInfo',
                'VERSION': '1.3.0',
                'INFO_FORMAT': /^text\/html/,
                'LAYERS': layers.join(),
                'QUERY_LAYERS': layers.join(),
                'STYLE': 'default,default,default',
                'WIDTH': '870',
                'HEIGHT': '575',
                'I': '644',
                'J': '282',
                'FEATURE_COUNT': '10',
                'CRS': 'EPSG:4326',
                'BBOX': /44.6568\d+,-1.2512\d+,47.3951\d+,2.8918\d+/,
            }
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', expectedParameters);

            // wait for response
            let getFeatureInfoResponse = await getFeatureInfoRequest.response();
            expect(getFeatureInfoResponse).not.toBeNull();
            expect(getFeatureInfoResponse?.ok()).toBe(true);
            expect(await getFeatureInfoResponse?.headerValue('Content-Type')).toContain('text/html');

            // time for rendering the popup
            await page.waitForTimeout(100);

            const popup = await project.identifyContentLocator(
                '1',
                'form_edition_upload_webdav_geom_c71ec5ff_dc88_451f_98e1_ccf41e34ddd7'
            );

            await expect(popup.locator('.lizmapPopupTitle')).toHaveText("form_edition_upload_webdav_geom");
            let uploadFields = popup.locator(".container.popup_lizmap_dd").locator(".before-tabs .control-group");
            await expect(uploadFields).toHaveCount(3);
            const resourceUrl = await popup.locator('#dd_jforms_view_edition_remote_path a').getAttribute("href");
            expect(resourceUrl).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");
            // no image preview
            await expect(popup.locator('#dd_jforms_view_edition_remote_path a').locator('img')).toHaveCount(0);

            //clear screen
            await page.locator('#dock-close').click();

            let getFeatureRequestPromise = page.waitForRequest(request =>
                request.method() === 'POST'
                && request.postData()?.includes('GetFeature') === true
            );

            await page.locator("#button-attributeLayers").click();
            await page.locator("button[value='form_edition_upload_webdav_geom']").click();
            await getFeatureRequestPromise;

            let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav_geom");
            await expect(attrTable).toHaveCount(1);
            await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");
            await expect(attrTable.locator("tr").nth(2).locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.conf");
            await expect(attrTable.locator("tr").nth(3).locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.txt");
        });

        test("Inspect popups and attribute table for non-postgre layers", async ({ page }) => {
            const project = new ProjectPage(page, 'form_upload_webdav');
            await project.open();
            await project.closeLeftDock();

            let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
            await project.clickOnMap(397, 180);

            let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            let layers = [
                'form_edition_upload_webdav_geom',
                'for_edition_upload_webdav_shape',
                'form_edition_upload_webdav_parent_geom',
            ];
            const expectedParameters = {
                'SERVICE': 'WMS',
                'REQUEST': 'GetFeatureInfo',
                'VERSION': '1.3.0',
                'INFO_FORMAT': /^text\/html/,
                'LAYERS': layers.join(),
                'QUERY_LAYERS': layers.join(),
                'STYLE': 'default,default,default',
                'WIDTH': '870',
                'HEIGHT': '575',
                'I': '397',
                'J': '180',
                'FEATURE_COUNT': '10',
                'CRS': 'EPSG:4326',
                'BBOX': /44.6568\d+,-1.2512\d+,47.3951\d+,2.8918\d+/,
            }
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', expectedParameters);

            // wait for response
            let getFeatureInfoResponse = await getFeatureInfoRequest.response();
            expect(getFeatureInfoResponse).not.toBeNull();
            expect(getFeatureInfoResponse?.ok()).toBe(true);
            expect(await getFeatureInfoResponse?.headerValue('Content-Type')).toContain('text/html');

            // time for rendering the popup
            await page.waitForTimeout(100);

            const popup = await project.identifyContentLocator(
                '1',
                'for_edition_upload_webdav_shape_caf087fb_dfd0_40c5_93a4_ac1ae5648e96'
            );

            await expect(popup.locator('.lizmapPopupTitle')).toHaveText("form_edition_upload_webdav_shape");
            const popupTable = popup.locator('.lizmapPopupTable');
            await expect(popupTable).toHaveCount(1);
            await expect(popupTable.locator('tbody tr')).toHaveCount(3);

            await expect(popupTable.locator("tbody tr").nth(1).locator("td").locator("a")).toHaveCount(1);
            const resourceUrl = await popupTable.locator("tbody tr").nth(1).locator("td").locator("a").getAttribute("href");
            expect(resourceUrl).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");

            // image preview
            const imageUrl = await popupTable.locator("tbody tr").nth(1).locator("td").locator("a img").getAttribute("src");
            expect(imageUrl).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");

            //clear screen
            await page.locator('#dock-close').click();

            let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData()?.includes('GetFeature') === true);
            await page.locator("#button-attributeLayers").click();
            await page.locator("button[value='form_edition_upload_webdav_shape']").click();
            await getFeatureRequestPromise;

            let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav_shape");
            await expect(attrTable).toHaveCount(1);
            await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.conf");
            await expect(attrTable.locator("tr").nth(2).locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");

        });

        test('GetMedia, different file type from webdav storage', async ({ page, request }) => {
            const project = new ProjectPage(page, 'form_upload_webdav');
            await project.open();
            await project.closeLeftDock();

            let getFeatureRequestPromise = page.waitForRequest(request =>
                request.method() === 'POST'
                && request.postData()?.includes('GetFeature') === true
            );

            await page.locator("#button-attributeLayers").click();
            await page.locator("button[value='form_edition_upload_webdav_geom']").click();
            await getFeatureRequestPromise;

            let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav_geom");

            await expect(attrTable).toHaveCount(1);

            // file.png
            await expect(attrTable.locator("tr[id='1']").locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");

            const getLogo = await attrTable.locator("tr[id='1']").locator("td").nth(2).locator("a").getAttribute("href") || "";

            const logoReq = await request.get(getLogo);
            expect(logoReq.status()).toBe(200);
            expect(logoReq.headers()["content-type"]).toBe("image/png");

            // file .conf
            await expect(attrTable.locator("tr[id='2']").locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.conf");

            const downloadPromise = page.waitForEvent('download');
            await attrTable.locator("tr[id='2']").locator("td").nth(2).locator("a").click();
            const download = await downloadPromise;

            expect(download.suggestedFilename()).toBe("test_upload.conf");

            const getConfFile = await attrTable.locator("tr[id='2']").locator("td").nth(2).locator("a").getAttribute("href") || "";

            const confReq = await request.get(getConfFile);
            expect(confReq.status()).toBe(200);
            expect(confReq.headers()["content-type"]).toBe("application/octet-stream");

            // file .txt
            await expect(attrTable.locator("tr[id='3']").locator("td").nth(2).locator("a")).toHaveAttribute("href", "/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.txt");

            const getTxtFile = await attrTable.locator("tr[id='3']").locator("td").nth(2).locator("a").getAttribute("href") || "";

            const txtFileReq = await request.get(getTxtFile);
            expect(txtFileReq.status()).toBe(200);
            expect(txtFileReq.headers()["content-type"]).toContain("text/plain");

        });

        test('Inspect popupAllFeaturesCompact data table in popup', async ({ page }) => {
            const project = new ProjectPage(page, 'form_upload_webdav');
            await project.open();
            await project.closeLeftDock();

            let getFeatureInfoRequestPromise = project.waitForGetFeatureInfoRequest();
            await project.clickOnMap(484, 377);

            let getFeatureInfoRequest = await getFeatureInfoRequestPromise;
            let layers = [
                'form_edition_upload_webdav_geom',
                'for_edition_upload_webdav_shape',
                'form_edition_upload_webdav_parent_geom',
            ];
            const expectedParameters = {
                'SERVICE': 'WMS',
                'REQUEST': 'GetFeatureInfo',
                'VERSION': '1.3.0',
                'INFO_FORMAT': /^text\/html/,
                'LAYERS': layers.join(),
                'QUERY_LAYERS': layers.join(),
                'STYLE': 'default,default,default',
                'WIDTH': '870',
                'HEIGHT': '575',
                'I': '484',
                'J': '377',
                'FEATURE_COUNT': '10',
                'CRS': 'EPSG:4326',
                'BBOX': /44.6568\d+,-1.2512\d+,47.3951\d+,2.8918\d+/,
            }
            await expectParametersToContain('GetFeatureInfo', getFeatureInfoRequest.postData() ?? '', expectedParameters);

            // wait for response
            let getFeatureInfoResponse = await getFeatureInfoRequest.response();
            expect(getFeatureInfoResponse).not.toBeNull();
            expect(getFeatureInfoResponse?.ok()).toBe(true);
            expect(await getFeatureInfoResponse?.headerValue('Content-Type')).toContain('text/html');

            // time for rendering the popup
            await page.waitForTimeout(100);

            const popup = await project.identifyContentLocator(
                '1',
                'form_edition_upload_webdav_parent_geom_8c26e78b_f73b_4b2a_9c0e_d7a9e185346e'
            );
            await expect(popup.locator('.lizmapPopupTitle').first()).toHaveText("form_edition_upload_webdav_parent_geom");

            let children = popup.locator('.lizmapPopupChildren');
            await expect(children).toHaveCount(1);

            // inspect distinct children tables
            await expect(children.locator(".lizmapPopupSingleFeature")).toHaveCount(2);

            // first table
            let firstChild = children.locator(".lizmapPopupSingleFeature").nth(0);
            let popupTable = firstChild.locator('.lizmapPopupTable');
            await expect(popupTable).toHaveCount(1);

            await expect(popupTable.locator('tbody tr').nth(0).locator('th')).toHaveText('Id');
            await expect(popupTable.locator('tbody tr').nth(0).locator('td')).toHaveText('2');
            await expect(popupTable.locator('tbody tr').nth(1).locator('th')).toHaveText('Id parent');
            await expect(popupTable.locator('tbody tr').nth(1).locator('td')).toHaveText('1');
            await expect(popupTable.locator('tbody tr').nth(2).locator('th')).toHaveText('remote_path');
            const firstChildresourceUrl = await popupTable.locator('tbody tr').nth(2).locator("td a").getAttribute("href");
            expect(firstChildresourceUrl).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Ftest_upload.conf");

            // second table
            let secondChild = children.locator(".lizmapPopupSingleFeature").nth(1);
            popupTable = secondChild.locator('.lizmapPopupTable');
            await expect(popupTable).toHaveCount(1);

            await expect(popupTable.locator('tbody tr').nth(0).locator('th')).toHaveText('Id');
            await expect(popupTable.locator('tbody tr').nth(0).locator('td')).toHaveText('1');
            await expect(popupTable.locator('tbody tr').nth(1).locator('th')).toHaveText('Id parent');
            await expect(popupTable.locator('tbody tr').nth(1).locator('td')).toHaveText('1');
            await expect(popupTable.locator('tbody tr').nth(2).locator('th')).toHaveText('remote_path');

            const secondChildresourceUrl = await popupTable.locator('tbody tr').nth(2).locator("td a").getAttribute("href");
            expect(secondChildresourceUrl).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");
            await expect(popupTable.locator('tbody tr').nth(2).locator("td a").locator("img")).toHaveCount(1)
            const secondChildImageSrc = await popupTable.locator('tbody tr').nth(2).locator("td a").locator("img").getAttribute("src");
            expect(secondChildImageSrc).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");

            // inspect popupAllFeaturesCompact table
            await expect(children.locator(".popupAllFeaturesCompact")).toHaveCount(1);
            await expect(children.locator(".popupAllFeaturesCompact")).not.toBeVisible();
            await expect(children.locator('.compact-tables')).toHaveCount(1);

            //click on the compact table button
            await children.locator('.compact-tables').click();
            await expect(children.locator('.popupAllFeaturesCompact')).toBeVisible();
            const allFeatureDataTable = children.locator('.popupAllFeaturesCompact table');
            await expect(allFeatureDataTable).toHaveCount(1);

            // first row
            await expect(allFeatureDataTable.locator("tbody tr").nth(0).locator("td").nth(1)).toHaveText("1");
            await expect(allFeatureDataTable.locator("tbody tr").nth(0).locator("td").nth(2)).toHaveText("1");
            const firstRowFilePath = await allFeatureDataTable.locator("tbody tr").nth(0).locator("td").nth(3).locator("a").getAttribute("href");
            expect(firstRowFilePath).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");
            const firstRowSrc = await allFeatureDataTable.locator("tbody tr").nth(0).locator("td").nth(3).locator("a").locator("img").getAttribute("src");
            expect(firstRowSrc).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png")

            // second row
            await expect(allFeatureDataTable.locator("tbody tr").nth(1).locator("td").nth(1)).toHaveText("2");
            await expect(allFeatureDataTable.locator("tbody tr").nth(1).locator("td").nth(2)).toHaveText("1");
            const secondRowFilePath = await allFeatureDataTable.locator("tbody tr").nth(1).locator("td").nth(3).locator("a").getAttribute("href");
            expect(secondRowFilePath).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Ftest_upload.conf");
        });
    });
