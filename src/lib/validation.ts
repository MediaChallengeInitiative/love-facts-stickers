import { z } from 'zod'

export const downloadRequestSchema = z.object({
  stickerId: z.string().min(1, 'Sticker ID is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').optional().nullable(),
  name: z.string().max(100, 'Name is too long').optional().nullable(),
  downloadType: z.enum(['single', 'collection', 'pack']).default('single'),
  isAnonymous: z.boolean().default(false),
}).refine(
  (data) => data.isAnonymous || data.email || data.phone,
  {
    message: 'Either email or phone is required (or choose anonymous download)',
    path: ['email'],
  }
)

export const collectionDownloadSchema = z.object({
  collectionId: z.string().min(1, 'Collection ID is required'),
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').optional().nullable(),
  name: z.string().max(100, 'Name is too long').optional().nullable(),
  isAnonymous: z.boolean().default(false),
}).refine(
  (data) => data.isAnonymous || data.email || data.phone,
  {
    message: 'Either email or phone is required (or choose anonymous download)',
    path: ['email'],
  }
)

export const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address').optional().nullable(),
  phone: z.string().min(7, 'Phone number must be at least 7 digits').optional().nullable(),
  requestType: z.enum(['unsubscribe', 'delete_data']).default('unsubscribe'),
}).refine(
  (data) => data.email || data.phone,
  {
    message: 'Either email or phone is required',
    path: ['email'],
  }
)

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const searchSchema = z.object({
  query: z.string().max(100).optional(),
  collection: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type DownloadRequest = z.infer<typeof downloadRequestSchema>
export type CollectionDownloadRequest = z.infer<typeof collectionDownloadSchema>
export type UnsubscribeRequest = z.infer<typeof unsubscribeSchema>
export type AdminLogin = z.infer<typeof adminLoginSchema>
export type SearchParams = z.infer<typeof searchSchema>
export type DateRange = z.infer<typeof dateRangeSchema>
