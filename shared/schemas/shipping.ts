import { z } from 'zod'

export const addressSchema = z.object({
  contactName: z.string().trim().min(2).max(100),
  company: z.string().trim().max(120).optional(),
  address1: z.string().trim().min(3).max(160),
  address2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(2).max(100),
  region: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(20),
  countryCode: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  phone: z.string().trim().max(30).optional(),
  // Empty optional contact emails are sent as '' by the shipping form.\n  email: z.union([z.email(), z.literal('')]).optional().transform(value => value || undefined),
  residential: z.boolean().optional()
})

export const packageSchema = z.object({
  weight: z.number().positive().max(1000),
  weightUnit: z.enum(['lb', 'kg']),
  length: z.number().positive().max(500),
  width: z.number().positive().max(500),
  height: z.number().positive().max(500),
  dimensionUnit: z.enum(['in', 'cm'])
})

export const quoteRequestSchema = z.object({
  sender: addressSchema,
  recipient: addressSchema,
  packages: z.array(packageSchema).min(1).max(25),
  currency: z.string().length(3).default('CAD')
})

export const purchaseShipmentSchema = quoteRequestSchema.extend({
  quoteId: z.string().uuid()
})

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>
export type PurchaseShipmentInput = z.infer<typeof purchaseShipmentSchema>
