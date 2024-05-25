// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Landing page content', () => {

    test('Fill form & check content', async ({ browser }) => {

        const adminContext = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
        const page = await adminContext.newPage();
        // unanthenticated context
        const userContext = await browser.newContext();
        const userPage = await userContext.newPage();

        // Go to Landing Page admin
        await page.goto('admin.php');
        await page.getByRole('link', { name: 'Landing page content' }).click();
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
        await expect(page.locator('#admin-message div p')).toHaveText('Content of the landing page has been saved');

        // Go to Landing page
        await page.goto('index.php');
        // check text order
        await expect(page.locator('#landingPageContent')).toHaveText('Top for auth 1st Top for unauth 2nd');
        await expect(page.locator('#landingPageContentBottom')).toHaveText('Bottom for unauth 1st Bottom for auth 2nd');

        // check unauthenticated
        await userPage.goto('http://localhost:8130/index.php');

        await expect(userPage.locator('#landingPageContent')).toHaveText('Top for unauth 2nd');
        await expect(userPage.locator('#landingPageContentBottom')).toHaveText('Bottom for unauth 1st');

        // now, we'll disable content for unauthenticated in authed context
        await page.goto('admin.php');
        await page.getByRole('link', { name: 'Landing page content' }).click();
        await page.getByRole('group', { name: 'Top of the landing page' }).locator('.ck-content').last().fill('Top only');
        await page.getByRole('group', { name: 'Bottom of the landing page' }).locator('.ck-content').last().fill('Bottom only');
        await page.getByRole('group', { name: 'Top of the landing page' }).locator('.ck-content').first().fill('Top unauth only');
        await page.getByRole('group', { name: 'Bottom of the landing page' }).locator('.ck-content').first().fill('Bottom unauth only');

        await page.getByRole('group', { name: 'Top of the landing page' }).getByLabel('No').check();
        await page.getByRole('group', { name: 'Bottom of the landing page' }).getByLabel('No').check();
        await page.getByRole('button', { name: 'Save' }).click();
        await expect(page.locator('#admin-message div p')).toHaveText('Content of the landing page has been saved');

        // go to landing page ...
        await page.goto('index.php');
        await expect(page.locator('#landingPageContent')).toHaveText('Top only');
        await expect(page.locator('#landingPageContentBottom')).toHaveText('Bottom only');

        // check unauthed
        await userPage.goto('http://localhost:8130/index.php');
        await expect(userPage.locator('#landingPageContent')).toHaveText('Top unauth only');
        await expect(userPage.locator('#landingPageContentBottom')).toHaveText('Bottom unauth only');

    });
});
