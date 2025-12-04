#!/usr/bin/env node

/**
 * Fix Accessibility Issues Script
 *
 * Automatically replaces non-compliant color classes with WCAG AA alternatives
 */

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Color replacements map
const replacements = {
  // Text colors
  'text-opal-electric(?!-accessible)': 'text-opal-electric-accessible',
  'text-opal-light': 'text-opal-deep',
  'text-fire-gold(?!-dark)': 'text-fire-gold-dark',
  'text-opal-teal': 'text-opal-deep',

  // Hover states
  'hover:text-opal-electric(?!-accessible)': 'hover:text-opal-electric-accessible',
  'hover:text-opal-light': 'hover:text-opal-deep',

  // Focus states
  'focus:text-opal-electric(?!-accessible)': 'focus:text-opal-electric-accessible',
  'focus:ring-opal-electric(?!-accessible)': 'focus:ring-opal-electric-accessible',

  // Border colors
  'border-opal-electric(?!-accessible)': 'border-opal-electric-accessible',
  'border-opal-light': 'border-opal-deep',
  'hover:border-opal-electric(?!-accessible)': 'hover:border-opal-electric-accessible',
  'focus:border-opal-electric(?!-accessible)': 'focus:border-opal-electric-accessible',

  // Ring colors
  'ring-opal-electric(?!-accessible)': 'ring-opal-electric-accessible',
}

// Files to process
const filePatterns = [
  'src/**/*.tsx',
  'src/**/*.ts',
  'src/**/*.jsx',
  'src/**/*.js',
]

// Files to exclude
const excludePatterns = [
  'src/lib/accessibility/**',
  'src/styles/tokens.ts',
  'node_modules/**',
  'dist/**',
  '.next/**',
]

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8')
  let hasChanges = false

  // Apply each replacement
  for (const [pattern, replacement] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'g')
    const newContent = content.replace(regex, replacement)

    if (newContent !== content) {
      hasChanges = true
      content = newContent
    }
  }

  // Special case: Fix button contrast
  content = content.replace(
    /className="([^"]*)\btext-opal-electric-accessible\b([^"]*)"/g,
    (match, before, after) => {
      // Check if it's on a colored background
      if (before.includes('bg-') && !before.includes('bg-white')) {
        return `className="${before}text-white${after}"`
      }
      return match
    }
  )

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✓ Fixed: ${filePath}`)
    return true
  }

  return false
}

function main() {
  console.log('🔍 Scanning for accessibility issues...\n')

  let totalFiles = 0
  let fixedFiles = 0

  filePatterns.forEach(pattern => {
    const files = glob.sync(pattern, {
      ignore: excludePatterns,
    })

    files.forEach(file => {
      totalFiles++
      if (processFile(file)) {
        fixedFiles++
      }
    })
  })

  console.log('\n✅ Accessibility fixes complete!')
  console.log(`   Files scanned: ${totalFiles}`)
  console.log(`   Files fixed: ${fixedFiles}`)

  // Additional checks
  console.log('\n📋 Manual checks needed:')
  console.log('   - Review any custom color usage in CSS files')
  console.log('   - Test with screen readers')
  console.log('   - Verify focus indicators are visible')
  console.log('   - Check color contrast with browser DevTools')
}

// Run the script
main()