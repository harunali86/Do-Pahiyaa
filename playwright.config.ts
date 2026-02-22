import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './testsprite_tests',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        trace: 'on-first-retry',
        channel: 'chrome', // Use installed Google Chrome
        headless: true, // Run headless by default
    },
    projects: [
        {
            name: 'Google Chrome',
            use: { ...devices['Desktop Chrome'], channel: 'chrome' },
        },
    ],
});
