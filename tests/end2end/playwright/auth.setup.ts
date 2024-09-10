import { test as setup } from '@playwright/test';
import path from 'path';

const user_in_group_aFile = path.join(__dirname, './.auth/user_in_group_a.json');

setup('authenticate as user_in_group_a', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('admin.php/auth/login?auth_url_return=%2Findex.php');
  await page.locator('#jforms_jcommunity_login_auth_login').fill('user_in_group_a');
  await page.locator('#jforms_jcommunity_login_auth_password').fill('admin');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('index.php');

  // End of authentication steps.

  await page.context().storageState({ path: user_in_group_aFile });
});

const adminFile = path.join(__dirname, './.auth/admin.json');

setup('authenticate as admin', async ({ page }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto('admin.php/auth/login?auth_url_return=%2Findex.php');
  await page.locator('#jforms_jcommunity_login_auth_login').fill('admin');
  await page.locator('#jforms_jcommunity_login_auth_password').fill('admin');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Wait until the page receives the cookies.
  //
  // Sometimes login flow sets cookies in the process of several redirects.
  // Wait for the final URL to ensure that the cookies are actually set.
  await page.waitForURL('index.php');

  // End of authentication steps.

  await page.context().storageState({ path: adminFile });
});
