// @ts-check
import { test, expect } from '@playwright/test';
import {ProjectPage} from "./pages/project";

test.describe('Header',
    {
        tag: ['@readonly'],
    },
    () => {

        test('Login info as user A on the landing page', async ({ browser }) => {
            const userA = await browser.newContext({ storageState: 'playwright/.auth/user_in_group_a.json' });
            const page = await userA.newPage();
            await page.goto('index.php');

            await expect(page.locator("#info-user-login")).toHaveText("user_in_group_a");
            await expect(page.locator("#info-user-firstname")).toHaveText("User A");
            await expect(page.locator("#info-user-firstname")).toHaveAttribute('style', 'display:none');
            await expect(page.locator("#info-user-firstname")).not.toBeVisible();
            await expect(page.locator("#info-user-lastname")).toHaveText("Testadiferro");
            await expect(page.locator("#info-user-lastname")).toHaveAttribute('style', 'display:none');
            await expect(page.locator("#info-user-lastname")).not.toBeVisible();
            await expect(page.locator("#info-user-organization")).toHaveText("Make it KISS");
            await expect(page.locator("#info-user-organization")).not.toBeVisible();
            await expect(page.locator("#info-user-organization")).toHaveAttribute('style', 'display:none');
        });

        test('Login info as user A on project page', async ({ browser }) => {
            const userA = await browser.newContext({ storageState: 'playwright/.auth/user_in_group_a.json' });
            const userPage = await userA.newPage();
            const projectPage = new ProjectPage(userPage, 'world-3857');
            await projectPage.open();

            await expect(userPage.locator("#info-user-login")).toHaveText("user_in_group_a");
            await expect(userPage.locator("#info-user-firstname")).toHaveText("User A");
            await expect(userPage.locator("#info-user-firstname")).toHaveAttribute('style', 'display:none');
            await expect(userPage.locator("#info-user-firstname")).not.toBeVisible();
            await expect(userPage.locator("#info-user-lastname")).toHaveText("Testadiferro");
            await expect(userPage.locator("#info-user-lastname")).toHaveAttribute('style', 'display:none');
            await expect(userPage.locator("#info-user-lastname")).not.toBeVisible();
            await expect(userPage.locator("#info-user-organization")).toHaveText("Make it KISS");
            await expect(userPage.locator("#info-user-organization")).toHaveAttribute('style', 'display:none');
            await expect(userPage.locator("#info-user-organization")).not.toBeVisible();
        });

        test('Login info as anonymous on the landing page', async ({ page }) => {
            await page.goto('index.php');
            await expect(page.locator("#headermenu .login")).toHaveText("Connect");
        });

        test('Login info as anonymous on project page', async ({ page }) => {
            const projectPage = new ProjectPage(page, 'world-3857');
            await projectPage.open();
            await expect(page.locator("#headermenu .login")).toHaveText("Connect");
        });
    }
);
