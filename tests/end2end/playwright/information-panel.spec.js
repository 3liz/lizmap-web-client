// @ts-check
import { expect, test } from '@playwright/test';
import { getAuthStorageStatePath } from './globals';
import { ProjectPage } from "./pages/project.js";

test.describe('Information panel',
    {
        tag: ['@readonly'],
    }, () => {

        [
            { user: 'admin', visible: true },
            { user: 'user_read_only', visible: false },
        ].forEach(({ user, visible }) => {
            test(`WFS link, with user ${user}`, async ({ browser }) => {
                const adminContext = await browser.newContext({ storageState: getAuthStorageStatePath(user) });
                const page = await adminContext.newPage();
                const project = new ProjectPage(page, 'atlas');
                await project.open();
                await project.buttonMetadata.click();
                await expect(
                    project.page.getByRole('link', { name: 'WFS URL' })
                ).toBeVisible({visible: visible});
            });
        });
    }
);
