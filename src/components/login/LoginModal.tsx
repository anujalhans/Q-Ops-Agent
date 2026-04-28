import { useState } from 'react'
import type { FormEvent } from 'react'
import { Lock, User } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Modal from '../common/Modal'

type Props = {
  open: boolean
  onClose: () => void
  onSubmit: (username: string, password: string) => boolean
  onForgotPassword: () => void
}

export default function LoginModal({ open, onClose, onSubmit, onForgotPassword }: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const ok = onSubmit(username, password)
    if (ok) {
      setError('')
      setUsername('')
      setPassword('')
    } else {
      setError('Invalid username or password.')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Login to Q-Ops Agent">
      <p className="mb-1 text-sm font-semibold text-on-surface">Welcome back, QA lead.</p>
      <p className="mb-6 text-sm text-on-surface-variant">Having trouble? Try demo access.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Username"
          icon={<User className="h-4 w-4" />}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="admin"
          autoComplete="username"
          required
        />
        <Input
          label="Password"
          icon={<Lock className="h-4 w-4" />}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="********"
          autoComplete="current-password"
          error={error || undefined}
          required
        />
        <div className="flex items-center gap-2 text-xs text-success">
          <span className="h-2 w-2 rounded-full bg-success" />
          All systems operational
        </div>
        <Button type="submit" variant="primary" fullWidth>
          Login
        </Button>
      </form>
      <div className="mt-4 text-center">
        <button type="button" onClick={onForgotPassword} className="text-sm text-primary hover:underline">
          Forgot your password?
        </button>
      </div>
    </Modal>
  )
}
