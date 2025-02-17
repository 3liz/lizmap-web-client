// @ts-check
import { test, expect } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';
import {HomePage} from "./pages/homepage";
import {AdminPage} from "./pages/admin";

test.describe('Landing page content', {
}, () => {

    test('Fill form & check content', {
        tag: '@write',
    }, async ({ browser }) =>
    {
        const adminContext = await browser.newContext({ storageState: getAuthStorageStatePath('admin') });
        const page = await adminContext.newPage();
        const adminPage = new AdminPage(page);
        // unanthenticated context
        const userContext = await browser.newContext();
        const userPage = await userContext.newPage();
        const homeUserPage = new HomePage(userPage);
        const homeAdminPage = new HomePage(page);

        // Go to Landing Page admin
        await page.goto('admin.php');
        await adminPage.openPage('Landing page content');
        // set top content
        // NOTE : use .ck-content to get the CKEditor
        await page.getByRole('group', { name: 'Top of the landing page' }).locator('.ck-content').first().fill('Top for unauth 2nd');
        await page.getByRole('group', { name: 'Top of the landing page' }).locator('.ck-content').last().fill('Top for auth 1st');
        await page.getByRole('group', { name: 'Top of the landing page' }).getByLabel('After content for authenticated').check();

        // set bottom content
        await page.getByRole('group', { name: 'Bottom of the landing page' }).locator('.ck-content').first().fill('Bottom for unauth 1st');
        await page.getByRole('group', { name: 'Bottom of the landing page' }).locator('.ck-content').last().fill('Bottom for auth 2nd');
        await page.getByRole('group', { name: 'Bottom of the landing page' }).getByLabel('Before content for authenticated').check();

        // save form and ensure, it's ok
        await page.getByRole('button', { name: 'Save' }).click();
        await adminPage.checkAlert('alert-success', 'Content of the landing page has been saved');

        // Go to Landing page
        await page.goto('index.php');
        // check text order
        await expect(homeAdminPage.topContent).toHaveText('Top for auth 1st Top for unauth 2nd');
        await expect(homeAdminPage.bottomContent).toHaveText('Bottom for unauth 1st Bottom for auth 2nd');

        // check unauthenticated
        await userPage.goto('index.php');

        await expect(homeUserPage.topContent).toHaveText('Top for unauth 2nd');
        await expect(homeUserPage.bottomContent).toHaveText('Bottom for unauth 1st');

        // now, we'll disable content for unauthenticated in authed context
        await page.goto('admin.php');
        await adminPage.openPage('Landing page content');
        await page.getByRole('group', { name: 'Top of the landing page' }).locator('.ck-content').last().fill('Top only');
        await page.getByRole('group', { name: 'Bottom of the landing page' }).locator('.ck-content').last().fill('Bottom only');
        await page.getByRole('group', { name: 'Top of the landing page' }).locator('.ck-content').first().fill('Top unauth only');
        await page.getByRole('group', { name: 'Bottom of the landing page' }).locator('.ck-content').first().fill('Bottom unauth only');

        await page.getByRole('group', { name: 'Top of the landing page' }).getByLabel('No').check();
        await page.getByRole('group', { name: 'Bottom of the landing page' }).getByLabel('No').check();
        await page.getByRole('button', { name: 'Save' }).click();
        await adminPage.checkAlert('alert-success', 'Content of the landing page has been saved');

        // go to landing page ...
        await page.goto('index.php');
        await expect(homeAdminPage.topContent).toHaveText('Top only');
        await expect(homeAdminPage.bottomContent).toHaveText('Bottom only');

        // check unauthed
        await userPage.reload();
        await expect(homeUserPage.topContent).toHaveText('Top unauth only');
        await expect(homeUserPage.bottomContent).toHaveText('Bottom unauth only');

    });

    [
        { login: 'anonymous', count: 0 },
        { login: 'user_in_group_a', count: 1 },
        { login: 'admin', count: 0 },
    ].forEach(({ login, count}) => {
        test(`Check "project_acl" visibility according to "${login}" login and its group`,
            {
                tag: '@readonly',
            }, async ({browser}) => {
                let context;
                if (login !== 'anonymous') {
                    context = await browser.newContext({storageState: getAuthStorageStatePath(login)});
                } else {
                    context = await browser.newContext();
                }
                const homePage = new HomePage(await context.newPage());
                await homePage.open();
                await expect(homePage.page.getByRole('link', { name: 'project_acl' })).toHaveCount(count);
            });
    });
});
