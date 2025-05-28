// @ts-check
import { test } from '@playwright/test';
import { gotoMap } from './globals';

test.describe('Embed', () => {
    test('Dataviz does not generate error', async ({ page }) => {
        const url = '/index.php/view/embed/?repository=testsrepository&project=dataviz';
        await gotoMap(url, page);
    })
})
