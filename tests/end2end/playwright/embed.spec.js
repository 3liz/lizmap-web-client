// @ts-check
import { test } from '@playwright/test';
import { ProjectPage } from './pages/project';

test.describe('Embed @readonly', () => {
    test('Dataviz does not generate error', async ({ page }) => {
        const project = new ProjectPage(page, 'display_in_legend');
        await project.open();
    })
})
