import { test, expect } from '@playwright/test';

test('Homepage loads and Search works', async ({ page }) => {
    // Aggressively block all non-essential resources
    await page.route('**/*', route => {
        const url = route.request().url();
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            return route.continue();
        }
        return route.abort(); // Block EVERYTHING external (Unsplash, APIs, Analytics)
    });

    // 1. Visit Homepage
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // 2. Check Title or Key Elements
    await expect(page).toHaveTitle(/Do Pahiyaa|Bike/i);
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();

    // 3. Perform a Search
    const searchInput = page.getByPlaceholder(/search/i);
    await searchInput.fill('Ducati');
    await searchInput.press('Enter');

    // 4. Check URL or Results
    await expect(page).toHaveURL(/search/);
    // We expect some result or "No Results" but the page should load
    // Check for "Find Your Ride" which is the heading on search page
    await expect(page.getByText(/Find Your Ride/i)).toBeVisible();
    await expect(page.getByText(/results/i).first()).toBeVisible();
});

test('View Listing Details', async ({ page }) => {
    // Aggressively block all non-essential resources
    await page.route('**/*', route => {
        const url = route.request().url();
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            return route.continue();
        }
        return route.abort(); // Block EVERYTHING external (Unsplash, APIs, Analytics)
    });

    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

    // Find a "View Details" or listing card link. 
    // Based on page.tsx, we have "View Details" links or wrapping anchors.
    // Let's try to click the first listing card's main actionable area or specific link.
    // verified by page snapshot: link "View Details →"
    const viewDetailsParams = page.getByRole('link', { name: /view details/i }).first();

    // If no text link, try clicking a card.
    if (await viewDetailsParams.isVisible()) {
        await viewDetailsParams.click();
    } else {
        // Fallback to clicking an image or heading of a card
        await page.locator('a[href^="/listings/"]').first().click();
    }

    await expect(page).toHaveURL(/\/listings\//);
    await expect(page.getByRole('button', { name: /contact|inquiry|buy/i })).toBeVisible();
});

test('Sell Page Loads', async ({ page }) => {
    // Aggressively block all non-essential resources
    await page.route('**/*', route => {
        const url = route.request().url();
        if (url.includes('localhost') || url.includes('127.0.0.1')) {
            return route.continue();
        }
        return route.abort();
    });

    await page.goto('http://localhost:3000/sell', { waitUntil: 'domcontentloaded' });
    // Verify specific heading "Sell Your Bike in Minutes"
    await expect(page.getByRole('heading', { name: /Sell Your Bike/i })).toBeVisible();
    await expect(page.getByText(/Get the best price/i)).toBeVisible();
});
