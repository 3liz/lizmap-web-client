import { test, expect } from '@playwright/test';

test.describe('CORS',
    {
        tag: ['@localonly'],
    }, () => {

        test('send authorized request', async function ({ page }, testInfo) {
            test.skip(process.env.CI, 'Not working on GH Action');
            await page.goto('http://othersite.local:8130');
            await page.locator('#launch-request').click();
            await expect(page.locator('#status')).toHaveText('200');
            await expect(page.locator('#response')).not.toBeEmpty();
            expect(testInfo.stderr).toHaveLength(0);

        });


        test('send unauthorized request', async function ({ page }, testInfo) {
            test.skip(process.env.CI, 'Not working on GH Action');
            await page.goto(
                'http://othersite.local:8130');
            await page.locator('#launch-request-bad').click();
            await expect(page.locator('#status_bad')).toBeEmpty();
            await expect(page.locator('#response_bad')).toBeEmpty();
            expect(testInfo.stderr).not.toBe('');
        });

    });
