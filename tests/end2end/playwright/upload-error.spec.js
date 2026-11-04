import { expect, test } from '@playwright/test';
import * as path from 'path';
import { getRepositoryMediaFolder, playwrightTestFile } from './globals';
import * as fs from 'fs/promises';
import { ProjectPage } from "./pages/project";

test.describe('Upload error',
    {
        tag: ['@write'],
    }, () => {

        const noRightsFolderPath = path.join(getRepositoryMediaFolder(),'no_rights_folder');

        test.afterEach(async () => {
            // remove the test folder
            try {
                await fs.rm(noRightsFolderPath,{recursive:true});
            } catch (err) {
                console.error(`Error deleting directory: ${err}`);
            }
        });

        test('Upload file on folder with no write permission', async ({ page }) => {
            const project = new ProjectPage(page, 'form_upload_error');
            await project.open();
            await project.closeLeftDock();

            const formRequest = await project.openEditingFormWithLayer('form_edition_upload_webdav');
            await formRequest.response();

            await page.locator('#jforms_view_edition_local_path_jf_action_new_item').click();

            await page.locator('#jforms_view_edition_local_path').setInputFiles(playwrightTestFile('test_upload_file', 'test_upload_attribute_table.txt'));

            // create a temporary folder
            await fs.mkdir(noRightsFolderPath, {recursive:true});

            //and remove write rights to test the upload error
            await fs.chmod(noRightsFolderPath,0o555);

            // try to upload file
            let saveFeatureRequestPromise = page.waitForRequest(/lizmap\/edition\/saveFeature/);
            const submit = project.editingSubmit('submit');
            await submit.click();
            let saveFeatureRequest = await saveFeatureRequestPromise;
            await saveFeatureRequest.response();

            // expecting errors
            await expect(page.locator("#jforms_view_edition_errors")).toBeVisible();
            await expect(page.locator("#jforms_view_edition_errors")).toHaveText('The layer "form_edition_upload_webdav" directory for uploading media is not writable.')
        });
    }
);
