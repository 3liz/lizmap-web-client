import { test, expect } from '@playwright/test';

test.describe('WebDAV Server',()=>{
         test.beforeEach(async ({ page }) => {
                  const url = '/index.php/view/map/?repository=testsrepository&project=form_upload_webdav';
                  await page.goto(url, { waitUntil: 'networkidle' });
                  await page.locator('#dock-close').click();
         });

         test('Upload new file to remote server', async ({ page }) => {


                  await page.locator('#button-edition').click();
                  await page.locator('a#edition-draw').click();
                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click()

                  // upload test file
                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload.txt")

                  // submit the form
                  await page.locator('#jforms_view_edition__submit_submit').click();

                  // after uploading
                  await page.locator('#button-attributeLayers').click();
                  
                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));

                  await page.locator("button[value='form_edition_upload_webdav']").click();
                  await getFeatureRequestPromise;
                  
                  //time for rendering the table attribute
                  await expect(page.locator('#edition-form-container')).toBeHidden();
                  await expect(page.locator('#lizmap-edition-message')).toBeVisible();

         })
         test('Upload new file to remote server, inspect attribute table', async ({ page }) => {

                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await page.locator('#button-edition').click();
                  await page.locator('a#edition-draw').click();
                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();
                  
                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("edit");

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_attribute_table.txt")
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

                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await page.locator('#button-edition').click();
                  await page.locator('a#edition-draw').click();
                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();
                  
                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("edit");

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_attribute_table_keep.txt")
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

                  // with the form open, check if value of the radio button on remote_path is set on "keep"
                  await expect(page.locator("#jforms_view_edition_remote_path_jf_action_keep")).toBeChecked()

                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("close");
                  let getNewFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  await page.locator('#jforms_view_edition__submit_submit').click();

                  //await editFeatureRequestPromise;
                  
                  await getNewFeatureRequestPromise;

                  await page.waitForTimeout(300);

                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(1)).toHaveText(id);
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='"+id+"']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/remoteData/test_upload_attribute_table_keep.txt");


         })

         test('Change file after reopen form, inspect attribute table', async ({ page }) => {

                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await page.locator('#button-edition').click();
                  await page.locator('a#edition-draw').click();
                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click();
                  
                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("edit");

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_attribute_table_keep.txt")
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


                  
                  await page.locator("#jforms_view_edition_remote_path_jf_action_new").click()
                  await expect(page.locator("#jforms_view_edition_remote_path_jf_action_new")).toBeChecked()

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_replace.txt")
            
                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("close");

                  //let getNewFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
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

                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload_delete.txt")
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

                  
                  await page.locator("#jforms_view_edition_remote_path_jf_action_del").click()
                  await expect(page.locator("#jforms_view_edition_remote_path_jf_action_del")).toBeChecked()
         
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

         test('Upload file to different path, inspect attribute table', async ({ page }) => {
                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav_geom']").click();
                  await getFeatureRequestPromise;

                  let attrTable =  page.locator("#attribute-layer-table-form_edition_upload_webdav_geom");

                  await expect(attrTable).toHaveCount(1);

                  await expect(attrTable.locator("tr[id='1']")).toHaveCount(1);
                  await expect(attrTable.locator("tr[id='1']").locator("lizmap-feature-toolbar").locator("button.feature-edit")).toHaveCount(1);
                  await attrTable.locator("tr[id='1']").locator("lizmap-feature-toolbar").locator("button.feature-edit").click();

                  await page.locator('#jforms_view_edition_liz_future_action').selectOption("edit");

                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click()

                  

                  // upload test file
                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload.txt")
                 
                  await page.locator('#jforms_view_edition__submit_submit').click();
                  await editFeatureRequestPromise;
           
                  await page.waitForTimeout(300);
                  await expect(page.locator("div.alert.alert-block.alert-success")).toBeVisible();
                  await expect(attrTable.locator("tr[id='1']")).toHaveCount(1);
                  await expect(attrTable.locator("tr[id='1']").locator("td")).toHaveCount(4);

                  await expect(attrTable.locator("tr[id='1']").locator("td").nth(1)).toHaveText("1");
                  await expect(attrTable.locator("tr[id='1']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='1']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.txt");

         })

         test('GetMedia, different file type from webdav storage', async ({ page }) => {
                  let getFeatureRequestPromise = page.waitForRequest(request => request.method() === 'POST' && request.postData().includes('GetFeature'));
                  let editFeatureRequestPromise = page.waitForResponse(response => response.url().includes('editFeature'));
                  await page.locator("#button-attributeLayers").click();
                  await page.locator("button[value='form_edition_upload_webdav_geom']").click();
                  await getFeatureRequestPromise;

                  let attrTable =  page.locator("#attribute-layer-table-form_edition_upload_webdav_geom");

                  await expect(attrTable).toHaveCount(1);

                  await expect(attrTable.locator("tr[id='1']")).toHaveCount(1);
                  await expect(attrTable.locator("tr[id='1']").locator("lizmap-feature-toolbar").locator("button.feature-edit")).toHaveCount(1);
                  await attrTable.locator("tr[id='1']").locator("lizmap-feature-toolbar").locator("button.feature-edit").click();

                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click()

                  

                  // upload test txt file
                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload.txt")
                 
                  await page.locator('#jforms_view_edition__submit_submit').click();
                  await editFeatureRequestPromise;
           
                  await page.waitForTimeout(300);
                  await expect(attrTable.locator("tr[id='1']")).toHaveCount(1);
                  await expect(attrTable.locator("tr[id='1']").locator("td")).toHaveCount(4);

                  await expect(attrTable.locator("tr[id='1']").locator("td").nth(1)).toHaveText("1");
                  await expect(attrTable.locator("tr[id='1']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='1']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.txt");
                  

                  const pagePromise = page.context().waitForEvent('page');
                  await attrTable.locator("tr[id='1']").locator("td").nth(2).locator("a").click();
                  const newPage = await pagePromise;
                  await newPage.waitForLoadState();

                  expect(await newPage.screenshot()).toMatchSnapshot("test_upload.png");

                  await newPage.close();

                  // upload an image
                  await expect(attrTable.locator("tr[id='2']")).toHaveCount(1);
                  await expect(attrTable.locator("tr[id='2']").locator("lizmap-feature-toolbar").locator("button.feature-edit")).toHaveCount(1);
                  await attrTable.locator("tr[id='2']").locator("lizmap-feature-toolbar").locator("button.feature-edit").click();


                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click()
                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/logo.png")
                 
                  await page.locator('#jforms_view_edition__submit_submit').click();
                  await editFeatureRequestPromise;
           
                  await page.waitForTimeout(300);
                  await expect(attrTable.locator("tr[id='2']")).toHaveCount(1);
                  await expect(attrTable.locator("tr[id='2']").locator("td")).toHaveCount(4);

                  await expect(attrTable.locator("tr[id='2']").locator("td").nth(1)).toHaveText("2");
                  await expect(attrTable.locator("tr[id='2']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='2']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/logo.png");


                  
                  const pageLogoPromise = page.context().waitForEvent('page');
                  await attrTable.locator("tr[id='2']").locator("td").nth(2).locator("a").click();
                  const newPageLogo = await pageLogoPromise;
                  await newPageLogo.waitForLoadState();
                  //await expect(newPageLogo.locator("body img")).toHaveScreenshot("logo.png");
                  expect(await newPageLogo.locator("body img").screenshot()).toMatchSnapshot("logo.png");

                  await newPageLogo.close();

                  // upload conf file, should be downloaded

                  await expect(attrTable.locator("tr[id='3']")).toHaveCount(1);
                  await expect(attrTable.locator("tr[id='3']").locator("lizmap-feature-toolbar").locator("button.feature-edit")).toHaveCount(1);
                  await attrTable.locator("tr[id='3']").locator("lizmap-feature-toolbar").locator("button.feature-edit").click();


                  await page.locator('#jforms_view_edition_remote_path_jf_action_new').click()
                  await page.locator('#jforms_view_edition_remote_path').setInputFiles("./playwright/test_upload_file/test_upload.conf")
                 
                  await page.locator('#jforms_view_edition__submit_submit').click();
                  await editFeatureRequestPromise;
           
                  await page.waitForTimeout(300);
                  await expect(attrTable.locator("tr[id='3']")).toHaveCount(1);
                  await expect(attrTable.locator("tr[id='3']").locator("td")).toHaveCount(4);

                  await expect(attrTable.locator("tr[id='3']").locator("td").nth(1)).toHaveText("3");
                  await expect(attrTable.locator("tr[id='3']").locator("td").nth(2)).toHaveText("remote");
                  await expect(attrTable.locator("tr[id='3']").locator("td").nth(2).locator("a")).toHaveAttribute("href","/index.php/view/media/getMedia?repository=testsrepository&project=form_upload_webdav&path=dav/test_upload.conf");

                  const downloadPromise = page.waitForEvent('download');
                  await attrTable.locator("tr[id='3']").locator("td").nth(2).locator("a").click();
                  const download = await downloadPromise;

                  await expect(download.suggestedFilename()).toBe("test_upload.conf")

         })
})