'use client'

import { useState } from 'react'
import { Trash2, CheckCircle, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { validateEmail, validatePhone } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [requestType, setRequestType] = useState<'unsubscribe' | 'delete_data'>('delete_data')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})

  const validate = () => {
    const newErrors: { email?: string; phone?: string } = {}

    if (!email && !phone) {
      newErrors.email = 'Please provide either an email or phone number'
      newErrors.phone = 'Please provide either an email or phone number'
    }

    if (email && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (phone && !validatePhone(phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email || null,
          phone: phone || null,
          requestType,
        }),
      })

      if (!res.ok) {
        throw new Error('Request failed')
      }

      setIsSuccess(true)
      toast.success('Request submitted successfully')
    } catch (error) {
      console.error('Unsubscribe error:', error)
      toast.error('Failed to submit request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 pt-24 pb-16 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Request Submitted</h1>
          <p className="text-slate-400 mb-6">
            We&apos;ve received your request and will process it within 7 business days.
            You&apos;ll receive a confirmation once your data has been{' '}
            {requestType === 'delete_data' ? 'deleted' : 'updated'}.
          </p>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Return Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/20 rounded-2xl mb-4">
            <Trash2 className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Manage Your Data</h1>
          <p className="text-slate-400">
            Request to delete your data or unsubscribe from communications
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700">
          {/* Request Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-3">
              What would you like to do?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="radio"
                  name="requestType"
                  value="delete_data"
                  checked={requestType === 'delete_data'}
                  onChange={() => setRequestType('delete_data')}
                  className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <p className="text-white font-medium">Delete all my data</p>
                  <p className="text-xs text-slate-400">
                    Remove all personal information associated with your email/phone
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/50 cursor-pointer hover:bg-slate-700 transition-colors">
                <input
                  type="radio"
                  name="requestType"
                  value="unsubscribe"
                  checked={requestType === 'unsubscribe'}
                  onChange={() => setRequestType('unsubscribe')}
                  className="w-4 h-4 text-purple-500 focus:ring-purple-500"
                />
                <div>
                  <p className="text-white font-medium">Unsubscribe from communications</p>
                  <p className="text-xs text-slate-400">
                    Keep your data but stop receiving any emails or messages from us
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 mb-6">
            <p className="text-sm text-slate-400">
              Enter the email or phone number you used when downloading stickers:
            </p>

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setErrors({})
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.email ? 'border-red-500' : 'border-slate-600'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-400">{errors.email}</p>
            )}

            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-slate-700" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-slate-700" />
            </div>

            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  setErrors({})
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-xl bg-slate-700/50 border text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.phone ? 'border-red-500' : 'border-slate-600'
                }`}
              />
            </div>
            {errors.phone && !errors.email && (
              <p className="text-sm text-red-400">{errors.phone}</p>
            )}
          </div>

          {/* Submit */}
          <Button
            variant={requestType === 'delete_data' ? 'danger' : 'primary'}
            size="lg"
            className="w-full"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {requestType === 'delete_data' ? 'Delete My Data' : 'Unsubscribe'}
          </Button>

          <p className="text-xs text-slate-500 text-center mt-4">
            Requests are typically processed within 7 business days.
          </p>
        </div>
      </div>
    </div>
  )
}
