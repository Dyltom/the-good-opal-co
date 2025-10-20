import { test, expect } from '@playwright/test'

test.describe('Form Validation', () => {
  test('contact form should validate required fields', async ({ page }) => {
    await page.goto('/')

    // Scroll to contact form
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').last()
    await submitButton.click()

    // HTML5 validation should prevent submission
    // Check if name field has validation message
    const nameInput = page.locator('input[name="name"]')
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid)

    expect(isInvalid).toBe(true)
  })

  test('contact form should validate email format', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Fill with invalid email
    await page.locator('input[name="name"]').fill('John Doe')
    await page.locator('input[name="email"]').fill('invalid-email')
    await page.locator('textarea[name="message"]').fill('Test message')

    // Try submit
    await page.locator('button[type="submit"]').last().click()

    // HTML5 validation should catch invalid email
    const emailInput = page.locator('input[name="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)

    expect(isInvalid).toBe(true)
  })

  test('newsletter should validate email', async ({ page }) => {
    await page.goto('/')

    // Find newsletter section
    const newsletterSection = page.locator('text=Subscribe to Our Newsletter').locator('..')

    // Try invalid email
    await newsletterSection.locator('input[type="email"]').fill('invalid')
    await newsletterSection.locator('button[type="submit"]').click()

    // Should show validation
    const emailInput = newsletterSection.locator('input[type="email"]')
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid)

    expect(isInvalid).toBe(true)
  })
})
