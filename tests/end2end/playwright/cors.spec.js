import { test, expect } from '@playwright/test';

/**
 * Collect the errors reported by the browser (console + failed requests).
 * `testInfo.stderr` used to be asserted here, but it only carries what the Node
 * test process writes on stderr: it stays undefined, so the assertion could
 * never tell whether the browser blocked the request.
 * @param {import('@playwright/test').Page} page the page to watch
 * @returns {string[]} the collected error messages, filled while the page runs
 */
function collectBrowserErrors(page) {
    /** @type {string[]} */
    const errors = [];
    page.on('console', message => {
        if (message.type() === 'error') {
            errors.push(message.text());
        }
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request =>
        errors.push(`${request.url()} ${request.failure()?.errorText ?? ''}`));
    return errors;
}

test.describe('CORS',
    {
        tag: ['@localonly'],
    }, () => {

        test('send authorized request', async function ({ page }) {
            test.skip(!!process.env.CI, 'Not working on GH Action');
            const errors = collectBrowserErrors(page);
            await page.goto('http://othersite.local:8130');
            await page.locator('#launch-request').click();
            await expect(page.locator('#status')).toHaveText('200');
            await expect(page.locator('#response')).not.toBeEmpty();
            expect(errors).toEqual([]);
        });


        test('send unauthorized request', async function ({ page }) {
            test.skip(!!process.env.CI, 'Not working on GH Action');
            const errors = collectBrowserErrors(page);
            await page.goto(
                'http://othersite.local:8130');
            await page.locator('#launch-request-bad').click();
            await expect(page.locator('#status_bad')).toBeEmpty();
            await expect(page.locator('#response_bad')).toBeEmpty();
            // The browser must have refused to hand the response over to the page
            await expect.poll(() => errors.join('\n')).toContain('CORS');
        });

    });
