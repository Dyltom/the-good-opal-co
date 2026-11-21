import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  setValue: vi.fn(),
  value: null as number | null,
}))

vi.mock('@payloadcms/ui', () => ({
  FieldDescription: () => null,
  FieldError: () => null,
  FieldLabel: ({ htmlFor, label }: { htmlFor: string; label: string }) => (
    <label htmlFor={htmlFor}>{label}</label>
  ),
  useField: () => ({
    disabled: false,
    path: 'amountCents',
    setValue: mocks.setValue,
    showError: false,
    value: mocks.value,
  }),
}))

import { DollarAmountField } from '../DollarAmountField'

type Props = ComponentProps<typeof DollarAmountField>

function renderField() {
  const props = {
    field: { label: 'Quote total (AUD)', name: 'amountCents', required: true },
    path: 'amountCents',
  } as Props
  render(<DollarAmountField {...props} />)
  return screen.getByLabelText('Quote total (AUD)')
}

describe('DollarAmountField', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.value = null
  })

  test.each([
    ['1,250.50', 125050],
    ['19.99', 1999],
    ['$40', 4000],
    ['0.5', 50],
  ])('stores a dollar entry of %s as %i cents', (entry, cents) => {
    fireEvent.change(renderField(), { target: { value: entry } })

    expect(mocks.setValue).toHaveBeenLastCalledWith(cents)
  })

  test('shows the stored cents as dollars', () => {
    mocks.value = 125050

    expect(renderField()).toHaveValue('1250.50')
  })

  test('refuses fractions of a cent instead of rounding them', () => {
    fireEvent.change(renderField(), { target: { value: '12.345' } })

    expect(mocks.setValue).toHaveBeenLastCalledWith(null)
    expect(screen.getByRole('alert')).toHaveTextContent('Enter dollars and cents')
  })
})
