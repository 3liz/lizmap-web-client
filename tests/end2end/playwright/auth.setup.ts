import { test as setup } from '@playwright/test';
// @ts-ignore
import path from 'path';
import { Page } from '@playwright/test';

/**
 * The file directory path
 * @var string
 * @see https://nodejs.org/docs/latest-v15.x/api/esm.html#esm_no_filename_or_dirname
 * @see https://stackoverflow.com/questions/64963450/dirname-is-not-defined
 * @see https://stackoverflow.com/questions/8817423/why-is-dirname-not-defined-in-node-repl
 * @example
 * import { fileURLToPath } from 'url';
 * import { dirname } from 'path';
 * const __filename = fileURLToPath(import.meta.url);
 * const __dirname = dirname(__filename);
 */
const __dirname = path.resolve(path.dirname(''));

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
  await auth_using_login(page, 'user_in_group_a', 'admin', path.join(__dirname, './.auth/user_in_group_a.json'));
});

setup('authenticate as admin', async ({ page }) => {
  await auth_using_login(page, 'admin', 'admin', path.join(__dirname, './.auth/admin.json'));
});

setup('authenticate as publisher', async ({ page }) => {
  await auth_using_login(page, 'publisher', 'admin', path.join(__dirname, './.auth/publisher.json'));
});
