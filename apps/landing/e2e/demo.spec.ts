import { test, expect } from '@playwright/test';

test.describe('Demo Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
  });

  test('should load and display correctly', async ({ page }) => {
    // Check that the page loads
    await expect(page).toHaveTitle(/Paralegal AI/);
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /live demo/i })).toBeVisible();
    
    // Check description
    await expect(page.getByText(/interactive demonstration of privacy-first email summarization/i)).toBeVisible();
  });

  test('should have proper visual styling', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('h1', { state: 'visible' });
    
    // Take screenshot for visual regression testing
    await expect(page).toHaveScreenshot('demo-page-full.png', { fullPage: true });
    
    // Check that elements have background colors (not unstyled)
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el => 
      getComputedStyle(el).backgroundColor
    );
    
    // Should have dark background color, not default white
    expect(backgroundColor).toBe('rgb(9, 9, 11)');
  });

  test('should toggle between sections', async ({ page }) => {
    const summaryButton = page.getByRole('button', { name: /ai summary/i });
    const emailButton = page.getByRole('button', { name: /original email/i });
    
    // Click Original Email button
    await emailButton.click();
    
    // Click AI Summary button  
    await summaryButton.click();
    
    // Both sections should still be visible
    await expect(page.getByRole('heading', { name: /summary bullets/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /original email/i })).toBeVisible();
  });

  test('should have working summary bullet links', async ({ page }) => {
    const linkButtons = page.getByRole('button', { name: /link to source/i });
    
    // Should have multiple link buttons
    const count = await linkButtons.count();
    expect(count).toBe(4);
    
    // Click first link button
    await linkButtons.first().click();
    
    // Should still be on the same page
    expect(page.url()).toContain('/demo');
  });

  test('should have working contract flag links', async ({ page }) => {
    const viewButtons = page.getByRole('button', { name: /view in email/i });
    
    // Should have multiple view buttons
    const count = await viewButtons.count();
    expect(count).toBe(3);
    
    // Click first view button
    await viewButtons.first().click();
    
    // Should still be on the same page
    expect(page.url()).toContain('/demo');
  });

  test('should display contract flags with severity colors', async ({ page }) => {
    // Check for HIGH severity flags
    const highFlags = page.locator('text=HIGH');
    await expect(highFlags.first()).toBeVisible();
    
    // Check for MEDIUM severity flags  
    const mediumFlags = page.locator('text=MEDIUM');
    await expect(mediumFlags.first()).toBeVisible();
    
    // Take screenshot of contract flags section
    const flagsSection = page.locator('h3:has-text("Contract Flags")').locator('..');
    await expect(flagsSection).toHaveScreenshot('contract-flags.png');
  });

  test('should display email content correctly', async ({ page }) => {
    // Check email content is present
    await expect(page.getByText(/dear counsel/i)).toBeVisible();
    await expect(page.getByText(/sarah johnson/i)).toBeVisible();
    await expect(page.getByText(/johnsonlaw.com/i)).toBeVisible();
    
    // Check deployment information
    await expect(page.getByText(/in a real deployment/i)).toBeVisible();
    await expect(page.getByText(/clicking.*links scrolls to exact text spans/i)).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    // Test back to home link
    const backLink = page.getByRole('link', { name: /back to home/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
    
    // Test brand link
    const brandLink = page.getByRole('link', { name: /paralegal ai/i }).first();
    await expect(brandLink).toBeVisible();
    await expect(brandLink).toHaveAttribute('href', '/');
  });

  test('should be accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    
    // Check that focus is visible and functional
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test that all buttons are keyboard accessible
    const summaryButton = page.getByRole('button', { name: /ai summary/i });
    await summaryButton.focus();
    await expect(summaryButton).toBeFocused();
    
    await page.keyboard.press('Enter');
    // Should still be on demo page after activating button
    expect(page.url()).toContain('/demo');
  });

  test('should display privacy guarantee', async ({ page }) => {
    const privacySection = page.locator('text=🔒 Privacy Guarantee');
    await expect(privacySection).toBeVisible();
    
    await expect(page.getByText(/this demo uses mock data/i)).toBeVisible();
    await expect(page.getByText(/no email content ever reaches external apis/i)).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page, isMobile }) => {
    if (isMobile) {
      // Take screenshot on mobile
      await expect(page).toHaveScreenshot('demo-page-mobile.png', { fullPage: true });
      
      // Check that content is still accessible on mobile
      await expect(page.getByRole('heading', { name: /live demo/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /ai summary/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /original email/i })).toBeVisible();
    }
  });
});