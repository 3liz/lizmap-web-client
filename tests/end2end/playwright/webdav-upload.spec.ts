import { test, expect } from '@playwright/test';

test.describe('WebDAV Server',()=>{
         test.beforeEach(async ({ page }) => {
                  const url = '/index.php/view/map/?repository=testsrepository&project=form_upload_webdav';
                  await page.goto(url, { waitUntil: 'networkidle' });
                  await page.locator('#dock-close').click();
         });

         test('Upload new file to remote server, inspect attribute table', async ({ page }) => {

                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await page.locator('#button-edition').click();
                  await page.locator('a#edition-draw').click();
                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();

                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("edit");

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_attribute_table.txt");
                  // submit the form
                  await page.locator('#jforms_view_edition__submit_submit').click();

                  await editFeatureRequestPromise;

                  // Wait a bit for the UI to refresh
                  await page.waitForTimeout(300);

                  await expect(page.locator("div.alert.alert-block.alert-success")).toBeVisible();

                  let id = await page.locator('#jforms_view_edition_id').inputValue();

                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav']").click();
                  await getFeatureRequestPromise;

                  let attrTable =  page.locator("#attribute-layer-table-form_edition_upload_webdav");
                  await expect(attrTable).toHaveCount(1);

                  await expect(attrTable.locator("tr[id='"+id+"']")).toHaveCount(1);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td")).toHaveCount(4);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(1)).toHaveText(id);
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_attribute_table.txt");

         })

         test('Keep same file after reopen form, inspect attribute table', async ({ page }) => {

                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav_geom']").click();
                  await getFeatureRequestPromise;

                  let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav_geom");
                  await expect(attrTable).toHaveCount(1);
                  await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");
                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await attrTable.locator("tr").nth(1).locator("td").nth(0).locator("button[data-original-title='Edit']").click();
                  await editFeatureRequestPromise;
                  await page.waitForTimeout(300);

                  await expect(page.locator("#jforms_view_edition_remote_path_jf_action_keep")).toBeChecked()

                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("close");
                  let getNewFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator('#jforms_view_edition__submit_submit').click();

                  await getNewFeatureRequestPromise;

                  await page.waitForTimeout(300);

                  await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveText("remote");
                  await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");

         })

         test('Change file after reopen form, inspect attribute table', async ({ page }) => {

                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await page.locator('#button-edition').click();
                  await page.locator('a#edition-draw').click();
                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();

                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("edit");

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_attribute_table_keep.txt");
                  // submit the form
                  await page.locator('#jforms_view_edition__submit_submit').click();

                  await editFeatureRequestPromise;

                  await page.waitForTimeout(300);

                  await expect(page.locator("div.alert.alert-block.alert-success")).toBeVisible();

                  let id = await page.locator('#jforms_view_edition_id').inputValue();

                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav']").click();
                  await getFeatureRequestPromise;

                  let attrTable =  page.locator("#attribute-layer-table-form_edition_upload_webdav");
                  await expect(attrTable).toHaveCount(1);

                  await expect(attrTable.locator("tr[id='"+id+"']")).toHaveCount(1);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td")).toHaveCount(4);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(1)).toHaveText(id);
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_attribute_table_keep.txt");

                  await page.locator("#jforms_view_edition_remote_path_jf_action_new").click();
                  await expect(page.locator("#jforms_view_edition_remote_path_jf_action_new")).toBeChecked();

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_replace.txt");

                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("close");

                  await page.locator('#jforms_view_edition__submit_submit').click();

                  await editFeatureRequestPromise;

                  await getFeatureRequestPromise;

                  await page.waitForTimeout(300);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(1)).toHaveText(id);
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_replace.txt");

         })

         test('Delete file, inspect attribute table', async ({ page }) => {

                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await page.locator('#button-edition').click();
                  await page.locator('a#edition-draw').click();
                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();

                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("edit");

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_delete.txt");
                  // submit the form
                  await page.locator('#jforms_view_edition__submit_submit').click();

                  await editFeatureRequestPromise;

                  await page.waitForTimeout(300);

                  await expect(page.locator("div.alert.alert-block.alert-success")).toBeVisible();

                  let id = await page.locator('#jforms_view_edition_id').inputValue();

                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav']").click();
                  await getFeatureRequestPromise;

                  let attrTable =  page.locator("#attribute-layer-table-form_edition_upload_webdav");
                  await expect(attrTable).toHaveCount(1);

                  await expect(attrTable.locator("tr[id='"+id+"']")).toHaveCount(1);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td")).toHaveCount(4);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(1)).toHaveText(id);
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_delete.txt");


                  await page.locator("#jforms_view_edition_remote_path_jf_action_del").click();
                  await expect(page.locator("#jforms_view_edition_remote_path_jf_action_del")).toBeChecked();

                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("close");

                  //let getNewFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator('#jforms_view_edition__submit_submit').click();

                  await editFeatureRequestPromise;

                  await getFeatureRequestPromise;

                  await page.waitForTimeout(300);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(1)).toHaveText(id);
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2)).toHaveText("");
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2).locator("a")).toHaveCount(0);

         })

         test("Inspect popups and attribute table for postgre layers",async ({ page }) =>{

                  let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeatureInfo'));

                  await page.locator('#map').click({
                    position: {
                      x: 644,
                      y: 282
                    }
                  });
                  await getFeatureInfoRequestPromise;

                  //time for rendering the popup
                  await page.waitForTimeout(500);

                  await expect(page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTitle').first()).toHaveText("form_edition_upload_webdav_geom");
                  await expect(page.locator(".container.popup_lizmap_dd .before-tabs div.field")).toHaveCount(2);
                  const resourceUrl = await page.locator(".container.popup_lizmap_dd .before-tabs div.field").nth(1).locator("a").getAttribute("href");
                  expect(resourceUrl).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");
                  // no image preview
                  await expect(page.locator(".container.popup_lizmap_dd .before-tabs div.field").nth(1).locator("img")).toHaveCount(0);

                  //clear screen
                  await page.locator('#dock-close').click();

                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav_geom']").click();
                  await getFeatureRequestPromise;

                  let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav_geom");
                  await expect(attrTable).toHaveCount(1);
                  await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");
                  await expect(attrTable.locator("tr").nth(2).locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.conf");
                  await expect(attrTable.locator("tr").nth(3).locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.txt");
         })

         test("Inspect popups and attribute table for non-postgre layers",async ({ page }) =>{

                  let getFeatureInfoRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeatureInfo'));

                  await page.locator('#map').click({
                           position: {
                             x: 397,
                             y: 180
                           }
                  });
                  await getFeatureInfoRequestPromise;

                  //time for rendering the popup
                  await page.waitForTimeout(500);

                  await expect(page.locator('.lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTitle').first()).toHaveText("form_edition_upload_webdav_shape");
                  await expect(page.locator(".lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTable").locator("tbody tr")).toHaveCount(3);

                  await expect(page.locator(".lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTable").locator("tbody tr").nth(1).locator("td").locator("a")).toHaveCount(1);
                  const resourceUrl = await page.locator(".lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTable").locator("tbody tr").nth(1).locator("td").locator("a").getAttribute("href");
                  expect(resourceUrl).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");

                  // image preview
                  const imageUrl = await page.locator(".lizmapPopupContent > .lizmapPopupSingleFeature .lizmapPopupTable").locator("tbody tr").nth(1).locator("td").locator("a img").getAttribute("src");
                  expect(imageUrl).toContain("index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav%2Flogo.png");

                  //clear screen
                  await page.locator('#dock-close').click();

                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav_shape']").click();
                  await getFeatureRequestPromise;

                  let attrTable = page.locator("#attribute-layer-table-form_edition_upload_webdav_shape");
                  await expect(attrTable).toHaveCount(1);
                  await expect(attrTable.locator("tr").nth(1).locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.conf");
                  await expect(attrTable.locator("tr").nth(2).locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");

         })

         test('GetMedia, different file type from webdav storage', async ({ page,request }) => {
                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));

                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav_geom']").click();
                  await getFeatureRequestPromise;

                  let attrTable =  page.locator("#attribute-layer-table-form_edition_upload_webdav_geom");

                  await expect(attrTable).toHaveCount(1);

                  // file.png
                  await expect(attrTable.locator("tr[id='1']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");

                  const getLogo = await attrTable.locator("tr[id='1']").locator("td").nth(2).locator("a").getAttribute("href") || "";

                  const logoReq = await request.get(getLogo);
                  expect(logoReq.status()).toBe(200);
                  expect(logoReq.headers()["content-type"]).toBe("image/png");

                  // file .conf
                  await expect(attrTable.locator("tr[id='2']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.conf");

                  const downloadPromise = page.waitForEvent('download');
                  await attrTable.locator("tr[id='2']").locator("td").nth(2).locator("a").click();
                  const download = await downloadPromise;

                  expect(download.suggestedFilename()).toBe("test_upload.conf");

                  const getConfFile = await attrTable.locator("tr[id='2']").locator("td").nth(2).locator("a").getAttribute("href") || "";

                  const confReq = await request.get(getConfFile);
                  expect(confReq.status()).toBe(200);
                  console.log(confReq.headers());
                  expect(confReq.headers()["content-type"]).toBe("application/octet-stream");

                  // file .txt
                  await expect(attrTable.locator("tr[id='3']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.txt");

                  const getTxtFile = await attrTable.locator("tr[id='3']").locator("td").nth(2).locator("a").getAttribute("href") || "";

                  const txtFileReq = await request.get(getTxtFile);
                  expect(txtFileReq.status()).toBe(200);
                  expect(txtFileReq.headers()["content-type"]).toContain("text/plain");

         })
})
