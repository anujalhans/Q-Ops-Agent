import { useState } from 'react'
import type { FormEvent } from 'react'
import { Mail } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (email: string) => void
  onBackToLogin: () => void
}

export default function ForgotPasswordModal({ open, onClose, onSubmit, onBackToLogin }: Props) {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (email.trim()) {
      onSubmit(email.trim())
      setEmail('')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Reset Your Password">
      <p className="mb-1 text-sm font-semibold text-on-surface">No worries.</p>
      <p className="mb-6 text-sm text-on-surface-variant">
        Enter your email address and we will send you instructions to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email Address"
          icon={<Mail className="h-4 w-4" />}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          required
        />
        <Button type="submit" variant="primary" fullWidth>
          Send Reset Link
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button type="button" onClick={onBackToLogin} className="text-sm text-primary hover:underline">
          Back to Login
        </button>
      </div>
    </Modal>
  )
}
