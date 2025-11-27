'use client'

import { useState } from 'react'
import { Download, User, Mail, Phone, Shield, ExternalLink } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { validateEmail, validatePhone } from '@/lib/utils'
import Link from 'next/link'

interface DownloadGatingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { email?: string; phone?: string; name?: string; isAnonymous: boolean }) => void
  isLoading?: boolean
  downloadType: 'single' | 'collection'
  itemName: string
}

export function DownloadGatingModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  downloadType,
  itemName,
}: DownloadGatingModalProps) {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email')
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({})
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: { email?: string; phone?: string } = {}

    if (contactMethod === 'email') {
      if (!email) {
        newErrors.email = 'Email is required'
      } else if (!validateEmail(email)) {
        newErrors.email = 'Please enter a valid email address'
      }
    } else {
      if (!phone) {
        newErrors.phone = 'Phone number is required'
      } else if (!validatePhone(phone)) {
        newErrors.phone = 'Please enter a valid phone number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!agreedToPrivacy) {
      return
    }

    if (validateForm()) {
      onSubmit({
        email: contactMethod === 'email' ? email : undefined,
        phone: contactMethod === 'phone' ? phone : undefined,
        name: name || undefined,
        isAnonymous: false,
      })
    }
  }

  const handleAnonymousDownload = () => {
    onSubmit({
      isAnonymous: true,
    })
  }

  const resetForm = () => {
    setEmail('')
    setPhone('')
    setName('')
    setErrors({})
    setAgreedToPrivacy(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Quick — get your sticker pack">
      <div className="space-y-4 xs:space-y-6">
        {/* Explanation */}
        <div className="flex items-start gap-2.5 xs:gap-3 p-3 xs:p-4 bg-pink-500/10 border border-pink-500/20 rounded-lg xs:rounded-xl">
          <Shield className="w-4 h-4 xs:w-5 xs:h-5 text-pink-500 dark:text-pink-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs xs:text-sm text-slate-600 dark:text-slate-300">
            To help us measure impact and share future sticker packs, please enter an email or phone number.
            We&apos;ll not spam you.{' '}
            <Link href="/privacy" className="text-pink-500 dark:text-pink-400 hover:underline inline-flex items-center gap-1">
              Privacy policy <ExternalLink size={10} className="xs:w-3 xs:h-3" />
            </Link>
          </p>
        </div>

        {/* Contact Method Toggle */}
        <div className="flex gap-1.5 xs:gap-2 p-1 bg-slate-200 dark:bg-slate-700/50 rounded-lg xs:rounded-xl">
          <button
            onClick={() => {
              setContactMethod('email')
              setErrors({})
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 xs:gap-2 py-2 xs:py-2.5 rounded-md xs:rounded-lg text-xs xs:text-sm font-medium transition-all ${
              contactMethod === 'email'
                ? 'bg-pink-500 text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail size={14} className="xs:w-4 xs:h-4" />
            Email
          </button>
          <button
            onClick={() => {
              setContactMethod('phone')
              setErrors({})
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 xs:gap-2 py-2 xs:py-2.5 rounded-md xs:rounded-lg text-xs xs:text-sm font-medium transition-all ${
              contactMethod === 'phone'
                ? 'bg-pink-500 text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Phone size={14} className="xs:w-4 xs:h-4" />
            Phone
          </button>
        </div>

        {/* Form Fields */}
        <div className="space-y-3 xs:space-y-4">
          {contactMethod === 'email' ? (
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
          ) : (
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+256 700 000 000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
            />
          )}

          <Input
            label="Name (optional)"
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Privacy Checkbox */}
        <label className="flex items-start gap-2.5 xs:gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={agreedToPrivacy}
            onChange={(e) => setAgreedToPrivacy(e.target.checked)}
            className="mt-0.5 xs:mt-1 w-4 h-4 rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-pink-500 focus:ring-pink-500 focus:ring-offset-white dark:focus:ring-offset-slate-800"
          />
          <span className="text-xs xs:text-sm text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300">
            I agree to the collection of my contact information for impact measurement.
            I can request deletion at any time.
          </span>
        </label>

        {/* Download Buttons */}
        <div className="space-y-2.5 xs:space-y-3 pt-1 xs:pt-2">
          <Button
            variant="primary"
            size="lg"
            className="w-full text-sm xs:text-base"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!agreedToPrivacy}
          >
            <Download className="mr-1.5 xs:mr-2" size={18} />
            {downloadType === 'single' ? 'Download PNG' : 'Download ZIP'}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white dark:bg-slate-800 text-slate-500">or</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="md"
            className="w-full text-slate-400 text-xs xs:text-sm"
            onClick={handleAnonymousDownload}
            disabled={isLoading}
          >
            <User className="mr-1.5 xs:mr-2" size={14} />
            Download as guest
          </Button>
        </div>

        <p className="text-[10px] xs:text-xs text-slate-500 text-center">
          Downloading: <span className="text-slate-600 dark:text-slate-400">{itemName}</span>
        </p>
      </div>
    </Modal>
  )
}
