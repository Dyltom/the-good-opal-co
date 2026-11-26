import { z } from 'zod'

export const cartProductIdSchema = z.string().trim().min(1).max(128)

export const cartAddQuantitySchema = z.number().int().min(1).max(99)
export const cartUpdateQuantitySchema = z.number().int().min(0).max(99)
