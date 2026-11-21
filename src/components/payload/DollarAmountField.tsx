'use client'

import { useEffect, useState } from 'react'
import type { DefaultCellComponentProps, NumberFieldClientProps } from 'payload'
import { FieldDescription, FieldError, FieldLabel, useField } from '@payloadcms/ui'
import { formatPrice } from '@/lib/utils'

const DOLLAR_PATTERN = /^(\d+)(?:\.(\d{1,2}))?$/

function dollarsToCents(input: string): number | null {
  const match = DOLLAR_PATTERN.exec(
    input
      .trim()
      .replace(/^\$\s*/, '')
      .replace(/,/g, '')
  )
  if (!match) return null
  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'))
  return Number.isSafeInteger(cents) ? cents : null
}

function centsToDollarInput(cents: unknown): string {
  return typeof cents === 'number' ? (cents / 100).toFixed(2) : ''
}

export function DollarAmountField({
  field: { admin, label, required },
  path: pathFromProps,
  readOnly,
}: NumberFieldClientProps) {
  const { disabled, path, setValue, showError, value } = useField<number | null>({
    potentiallyStalePath: pathFromProps,
  })
  const [text, setText] = useState(() => centsToDollarInput(value))
  const invalid = text.trim() !== '' && dollarsToCents(text) === null

  useEffect(() => {
    setText((current) => (dollarsToCents(current) === value ? current : centsToDollarInput(value)))
  }, [value])

  const inputId = `field-${path.replace(/\./g, '__')}`
  const locked = readOnly || disabled

  return (
    <div
      className={['field-type', 'number', (showError || invalid) && 'error', locked && 'read-only']
        .filter(Boolean)
        .join(' ')}
    >
      <FieldLabel htmlFor={inputId} label={label} path={path} required={required} />
      <div className="field-type__wrap">
        <FieldError path={path} showError={showError} />
        {invalid && (
          <p role="alert" style={{ color: 'var(--theme-error-500)', margin: '0 0 8px' }}>
            Enter dollars and cents, like 1250 or 1250.50
          </p>
        )}
        <input
          id={inputId}
          name={path}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          disabled={locked}
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            setValue(dollarsToCents(event.target.value))
          }}
        />
        <FieldDescription description={admin?.description} path={path} />
      </div>
    </div>
  )
}

export function DollarAmountCell({ cellData }: DefaultCellComponentProps) {
  return typeof cellData === 'number' ? formatPrice(cellData) : null
}
