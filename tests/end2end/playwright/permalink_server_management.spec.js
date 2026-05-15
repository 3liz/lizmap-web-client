// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath, checkJson } from './globals';
import { AdminPage } from "./pages/admin";
import { ProjectPage } from "./pages/project";
import { expect as requestExpect } from './fixtures/expect-request.js';
import { expect as responseExpect } from './fixtures/expect-response.js'

test.describe('Permalinks management acl @readonly', () => {

    [
        { login: 'user_in_group_a', count:0},
        { login: 'admin', count:1},
    ].forEach(({login, count}) => {
        test(`Check ACL for "${login}" user` , async ({ browser }) => {
            const context = await browser.newContext({storageState: getAuthStorageStatePath(login)});
            const page = await context.newPage();
            const adminPage = new AdminPage(page);
            await adminPage.open();

            await expect(adminPage.menu.getByRole('link', { name: 'Permalink' })).toHaveCount(count);
        });
    })
});

test.describe('Permalink page',()=>{
    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('Permalink detail table and delete interaction @write', async ({browser, request}) => {
        const context = await browser.newContext({storageState: getAuthStorageStatePath('admin')});
        const page = await context.newPage();
        const adminPage = new AdminPage(page);
        await adminPage.open();
        await adminPage.openPage('Permalinks');
        await adminPage.checkPage('Permalinks');
        await expect(adminPage.page.getByTestId('permalink-total-stored')).toHaveText('6 permalinks stored');

        // inspect permalink detail table
        await adminPage.page.getByRole('link', { name: 'View detail' }).click();

        await adminPage.page.waitForTimeout(500);

        await adminPage.checkPage('Permalinks');
        const permalinkTable = adminPage.page.getByTestId('permalink-detail-table');
        await expect(permalinkTable.locator('tr')).toHaveCount(7);

        const tableHeader = permalinkTable.locator('tr').nth(0).locator('th');
        await expect(tableHeader).toHaveCount(6);

        await expect(tableHeader.nth(0)).toHaveText('Permalink');
        await expect(tableHeader.nth(1)).toHaveText('Parameters');
        await expect(tableHeader.nth(2)).toHaveText('Repository');
        await expect(tableHeader.nth(3)).toHaveText('Project');
        await expect(tableHeader.nth(4)).toHaveText('Creation date');
        await expect(tableHeader.nth(5)).toHaveText('Last usage date');

        await adminPage.page.getByRole('link', { name: 'Back' }).click();
        await adminPage.page.waitForTimeout(500);

        // check delete all records message
        adminPage.page.once('dialog', dialog => {
            expect(dialog.message()).toBe("Are you sure to want to empty the permalink table?");
            return dialog.dismiss();
        });
        await adminPage.page.getByRole('link', { name: 'Delete all records' }).click();
        await adminPage.page.waitForTimeout(500);

        const lastUsedInputGroup = adminPage.page.getByTestId('permalink-lastusage-input-group');
        await expect(lastUsedInputGroup.locator('label').nth(0)).toHaveText('Older than');
        await expect(lastUsedInputGroup.locator('label').nth(1)).toHaveText('days');

        // check delete permalinks last used before the specified number of days errors
        // empty days input
        await adminPage.checkLastUsagePermlainkDeleteErrorMessage();
        // NaN days input
        await adminPage.checkLastUsagePermlainkDeleteErrorMessage('not_a_number');
        // negative days input
        await adminPage.checkLastUsagePermlainkDeleteErrorMessage('-5');

        // Delete permalinks last used before 3 days
        await adminPage.deleteLastUsagePermlaink('3','2');
        await expect(adminPage.page.getByTestId('permalink-total-stored')).toHaveText('4 permalinks stored');
        // Submit again the same days value to check for no record deleted
        await adminPage.deleteLastUsagePermlaink('3','');

        // open a nep project and insert a new permalink

        const browserContext = await browser.newContext();
        const permalinkProjectPage = await browserContext.newPage();
        const permalinkProject = new ProjectPage(permalinkProjectPage, 'short_link_permalink');
        await permalinkProject.open();

        // change map appearance
        await permalinkProjectPage.getByTestId('single_wms_baselayer').locator('> div input').click();
        await permalinkProject.setLayerOpacity('single_wms_lines','60');
        await permalinkProject.changeLayerStyle('single_wms_points','default');

        let expectedPermalinkParameters = {
            repository:'testsrepository',
            project:'short_link_permalink',
            bbox: /3.6273\d+,43.4294\d+,4.1451\d+,43.7717\d+/,
            layers: 'single_wms_points,single_wms_lines',
            styles:'default,default',
            opacities:'1,0.6'
        }

        await permalinkProject.checkShortLinkPermalink(expectedPermalinkParameters);

        // open permalink panel
        await permalinkProject.openPermalinkPanel();
        expect(permalinkProjectPage.locator("#permalink-generator")).toBeVisible();
        expect(permalinkProjectPage.locator("#permalink-history table")).toHaveCount(0);

        // add new short link
        let permalinkAddRequestPromise = permalinkProject.waitForPermalinkAddRequest();
        await permalinkProjectPage.locator("#lizmap-new-permalink").click();
        let permalinkAddRequest = await permalinkAddRequestPromise;
        /** @type {{[key: string]: string|RegExp}} */
        const permalinkUrlParameters = {
            'o': 'add',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
        }

        requestExpect(permalinkAddRequest).toContainParametersInUrl(permalinkUrlParameters);
        let permalinkResponse = await permalinkAddRequest.response();
        responseExpect(permalinkResponse).toBeJson();

        let body = await permalinkResponse?.json();

        expect(body).toHaveProperty('permalink','JewKYGj9uRnu');
        // inspect history table
        expect(permalinkProjectPage.locator("#permalink-history table tr")).toHaveCount(1);
        await permalinkProject.inspectPermalinkHistoryTableRecord("JewKYGj9uRnu");

        // check counter on permalink page
        await adminPage.openPage('Permalinks');
        await adminPage.checkPage('Permalinks');
        await expect(adminPage.page.getByTestId('permalink-total-stored')).toHaveText('5 permalinks stored');

        // delete all records from permalink table
        await adminPage.deleteAllPermalinks();

        // change hash on the project page and check local storage;
        // the current permalink should be deleted because it no longer exists
        const newHash = '#permalink=JewKYGj9uRnu';
        let permalinkRequestPromise = permalinkProject.waitForPermalinkGetRequest();
        await permalinkProjectPage.evaluate(token => window.location.hash = token, newHash);
        let permalinkRequest = await permalinkRequestPromise;

        /** @type {{[key: string]: string|RegExp}} */
        const newPermalinkParameters = {
            'o': 'g',
            'repository': 'testsrepository',
            'project': 'short_link_permalink',
            'id': 'JewKYGj9uRnu',
        }
        requestExpect(permalinkRequest).toContainParametersInUrl(newPermalinkParameters);
        permalinkResponse = await permalinkRequest.response();
        responseExpect(permalinkResponse).toBeJson();
        await permalinkProjectPage.waitForTimeout(500);

        body = await permalinkResponse?.json();

        expect(body).toHaveProperty('error');
        expect(body.error).toStrictEqual(['The permalink does not exists']);

        // permalink table should be empty
        await expect(permalinkProjectPage.locator('table')).toHaveCount(0);
        const url_to_check = new URL(permalinkProjectPage.url());
        await permalinkProjectPage.waitForTimeout(500);
        expect(url_to_check.hash).toBe("#map_status");

        // insert permalink again
        let params = new URLSearchParams({
            o:'add',
            repository: 'testsrepository',
            project: 'short_link_permalink',
        });

        let url = `/index.php/lizmap/permalink?${params}`;
        let response = await request.post(url, {
            data: {
                permalink: {
                    bbox:["3.772082","43.547726","3.997095","43.652970"],
                    layers:["single_wms_lines","single_wms_baselayer"],
                    styles:["default","default"],
                    opacities:[1,1]
                }
            }
        });

        const insertBody = await checkJson(response);
        expect(insertBody).toHaveProperty('permalink', 'h47yokjwuJ4o');
    })

})
