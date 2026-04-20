/**
 * Test for font-display class implementation
 * This test ensures that the font-display class is properly defined and renders headings correctly
 */
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'

// Test component using font-display class (like the broken pages currently do)
const TestHeading = () => (
  <h1 className="font-display text-4xl">Test Heading</h1>
)

describe('Typography - font-display class', () => {
  test('should render headings with font-display class using proper serif font', () => {
    const { container } = render(<TestHeading />)
    const heading = container.querySelector('h1')

    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass('font-display')

    // Check computed styles to ensure font-family is applied
    const computedStyle = window.getComputedStyle(heading!)

    // Should use serif font family (Playfair Display or fallback serif)
    expect(computedStyle.fontFamily).toMatch(/serif|Playfair Display/i)

    // Should NOT be using browser default font
    expect(computedStyle.fontFamily).not.toMatch(/Times New Roman|Times/i)
  })

  test('should have font-display defined in Tailwind config', () => {
    // Create a test element with font-display class
    const testElement = document.createElement('div')
    testElement.className = 'font-display'
    document.body.appendChild(testElement)

    const computedStyle = window.getComputedStyle(testElement)

    // If font-display is properly configured, it should have a specific font-family
    // and not fall back to browser default
    expect(computedStyle.fontFamily).not.toBe('')
    expect(computedStyle.fontFamily).not.toBe('serif') // generic serif fallback

    document.body.removeChild(testElement)
  })
})