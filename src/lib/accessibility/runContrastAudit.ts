/**
 * Run contrast audit and output report
 */
import { generateContrastReport } from './contrast'

console.log('=== WCAG Color Contrast Audit ===\n')

const report = generateContrastReport()

// Group by compliance status
const failing = report.filter(r => !r.meetsAA)
const passingAA = report.filter(r => r.meetsAA && !r.meetsAAA)
const passingAAA = report.filter(r => r.meetsAAA)

if (failing.length > 0) {
  console.log('❌ FAILING WCAG AA (Must Fix):')
  failing.forEach(item => {
    console.log(`  - ${item.name}: ${item.ratio}:1`)
    if (item.recommendation) {
      console.log(`    → ${item.recommendation}`)
    }
  })
  console.log('')
}

if (passingAA.length > 0) {
  console.log('⚠️  WCAG AA Compliant (Consider AAA):')
  passingAA.forEach(item => {
    console.log(`  - ${item.name}: ${item.ratio}:1`)
  })
  console.log('')
}

if (passingAAA.length > 0) {
  console.log('✅ WCAG AAA Compliant:')
  passingAAA.forEach(item => {
    console.log(`  - ${item.name}: ${item.ratio}:1`)
  })
  console.log('')
}

console.log('Summary:')
console.log(`- Total color pairs: ${report.length}`)
console.log(`- WCAG AA failures: ${failing.length}`)
console.log(`- WCAG AA compliant: ${passingAA.length}`)
console.log(`- WCAG AAA compliant: ${passingAAA.length}`)

if (failing.length > 0) {
  console.log('\n⚠️  Action Required: Fix the failing color combinations to meet WCAG AA standards.')
  process.exit(1)
} else {
  console.log('\n✅ All color combinations meet WCAG AA standards!')
}