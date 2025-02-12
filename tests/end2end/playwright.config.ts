import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './playwright',
    snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
    /* Maximum time one test can run for. */
    timeout: 30 * 1000,
    expect: {
        /**
         * Maximum time expect() should wait for the condition to be met.
         * For example in `await expect(locator).toHaveText();`
         */
        timeout: 5000
    },
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 2 : undefined,
    /* Reporter to use.  */
    reporter: [
        [
            'json', {
            outputFile: 'playwright-report/test-results.json',
        }],
        [
            'playwright-ctrf-json-reporter', {
            outputFile: process.env.CRTF_JSON_FILE ? process.env.CRTF_JSON_FILE : 'output.json'
        }],
        /* [process.env.CI ? 'github' : 'dot'] */
        [process.env.CI ? 'line' : 'list']
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:8130',
        viewport: {
            width: 900,
            height: 650
        },
        screenshot: 'only-on-failure',
        locale: 'en-US',
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'setup',
            testMatch: 'auth.setup.ts',
        },
        {
            name: 'chromium',
            use: {
                browserName: 'chromium',
            },
            dependencies: ['setup'],
        },

        {
            name: 'firefox',
            use: {
                browserName: 'firefox',
            },
            dependencies: ['setup'],
        },

        {
            name: 'webkit',
            use: {
                browserName: 'webkit',
            },
            dependencies: ['setup'],
        },

        {
            name: 'end2end',
            use: {
                browserName: 'chromium',
            },
            dependencies: ['setup'],
        },
        /* Test against mobile viewports. */
        // {
        //   name: 'Mobile Chrome',
        //   use: {
        //     ...devices['Pixel 5'],
        //   },
        // },
        // {
        //   name: 'Mobile Safari',
        //   use: {
        //     ...devices['iPhone 12'],
        //   },
        // },

        /* Test against branded browsers. */
        // {
        //   name: 'Microsoft Edge',
        //   use: {
        //     channel: 'msedge',
        //   },
        // },
        // {
        //   name: 'Google Chrome',
        //   use: {
        //     channel: 'chrome',
        //   },
        // },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    // outputDir: 'test-results/',

    /* Run your local dev server before starting the tests */
    // webServer: {
    //   command: 'npm run start',
    //   port: 3000,
    // },
});
