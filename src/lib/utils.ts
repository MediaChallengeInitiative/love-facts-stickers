import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Basic phone validation - accepts various formats
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/
  return phone.length >= 7 && phoneRegex.test(phone)
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return request.headers.get('x-real-ip') || null
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.substring(0, length) + '...'
}

// Collection name to slug mapping
export const COLLECTION_SLUGS: Record<string, string> = {
  'Call out Lies in a Fun Way': 'call-out-lies',
  'Kickstart Conversations': 'kickstart-conversations',
  'Respond to Misinformation': 'respond-to-misinformation',
  'Shift the Vibe': 'shift-the-vibe',
  'Make the Truth Go Viral': 'make-truth-viral',
}

// Collection descriptions
export const COLLECTION_DESCRIPTIONS: Record<string, string> = {
  'call-out-lies': 'Fun and creative stickers to call out misinformation with humor',
  'kickstart-conversations': 'Start meaningful discussions about media literacy',
  'respond-to-misinformation': 'Quick responses to counter false information',
  'shift-the-vibe': 'Lighten the mood while spreading truth',
  'make-truth-viral': 'Shareable stickers to amplify accurate information',
}
