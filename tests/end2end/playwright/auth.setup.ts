import { test as setup } from '@playwright/test';
// @ts-ignore
import { getAuthStorageStatePath } from './globals';
import { Page } from '@playwright/test';

/**
 * Performs the authentication steps
 * @param {Page} page The page object
 * @param {string} login The login
 * @param {string} password The password
 * @param {string} user_file The path to the file where the cookies will be stored
 */
export async function auth_using_login(page: Page, login: string, password: string, user_file: string) {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('admin.php/auth/login?auth_url_return=%2Findex.php');
  await page.locator('#jforms_jcommunity_login_auth_login').fill(login);
  await page.locator('#jforms_jcommunity_login_auth_password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait until the page receives the cookies.
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('index.php');

  // End of authentication steps.
  await page.context().storageState({ path: user_file });
}

setup('authenticate as user_in_group_a', async ({ page }) => {
  await auth_using_login(page, 'user_in_group_a', 'admin', getAuthStorageStatePath('user_in_group_a'));
});

setup('authenticate as admin', async ({ page }) => {
  await auth_using_login(page, 'admin', 'admin', getAuthStorageStatePath('admin'));
});

setup('authenticate as publisher', async ({ page }) => {
  await auth_using_login(page, 'publisher', 'admin', getAuthStorageStatePath('publisher'));
});
