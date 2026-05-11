import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, KeyRound, Loader2, ShieldAlert } from 'lucide-react'
import { acceptUserInvite, auditPasswordReset, fetchCurrentUser } from '../lib/api'
import type { CurrentUser } from '../lib/api'
import { clearSession, getAuthCallbackType, storeSessionFromAuthCallback, updateCurrentUserPassword } from '../lib/auth'

type ToastType = 'success' | 'error' | 'info'

type Props = {
  onAuthenticated: (user: CurrentUser) => void
  addToast: (toast: { title: string; message: string; type: ToastType }) => void
}

type CallbackState = 'loading' | 'ready' | 'submitting' | 'complete' | 'error'
type CallbackMode = 'invite' | 'recovery'

export default function AuthCallbackPage({ onAuthenticated, addToast }: Props) {
  const navigate = useNavigate()
  const hasConsumedCallback = useRef(false)
  const [state, setState] = useState<CallbackState>('loading')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [mode, setMode] = useState<CallbackMode>('invite')

  useEffect(() => {
    if (hasConsumedCallback.current) return
    hasConsumedCallback.current = true
    async function consumeAuthSession() {
      try {
        const callbackType = getAuthCallbackType(window.location.hash)
        if (!['invite', 'recovery'].includes(callbackType)) {
          throw new Error('This authentication link is not supported. Please request a fresh link.')
        }
        const nextMode = callbackType as CallbackMode
        setMode(nextMode)
        const session = await storeSessionFromAuthCallback(window.location.hash)
        if (nextMode === 'invite') {
          const accepted = await acceptUserInvite()
          if (!accepted?.id || accepted.status !== 'active') {
            throw new Error('The invite was verified, but the Q-Ops user profile was not activated.')
          }
        }
        window.history.replaceState(null, document.title, window.location.pathname)
        setEmail(session.user.email || '')
        setState('ready')
      } catch (error) {
        clearSession()
        setMessage(error instanceof Error ? error.message : 'Unable to process this authentication link.')
        setState('error')
      }
    }
    consumeAuthSession()
  }, [])

  const passwordError = useMemo(() => {
    if (!password) return ''
    if (password.length < 8) return 'Use at least 8 characters.'
    if (password !== confirmPassword && confirmPassword) return 'Passwords do not match.'
    return ''
  }, [confirmPassword, password])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password.length < 8 || password !== confirmPassword) return

    setState('submitting')
    setMessage('')
    try {
      await updateCurrentUserPassword(password)
      const user = await fetchCurrentUser()
      if (!user?.id || user.status !== 'active') {
        throw new Error('Your password was set, but the Q-Ops user profile could not be loaded.')
      }
      if (mode === 'recovery') {
        const audited = await auditPasswordReset()
        if (!audited) {
          addToast({
            title: 'Password changed',
            message: 'The password was updated, but the audit workflow did not confirm the database audit row.',
            type: 'info',
          })
        }
      }
      onAuthenticated(user)
      setState('complete')
      addToast({
        title: mode === 'invite' ? 'Invite accepted' : 'Password updated',
        message: mode === 'invite' ? 'Your Q-Ops Agent account is ready.' : 'Your Q-Ops Agent password has been changed.',
        type: 'success',
      })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      clearSession()
      setMessage(error instanceof Error ? error.message : 'Unable to finish password setup.')
      setState('error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10 text-on-surface">
      <main className="w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-xl sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {state === 'error' ? <ShieldAlert className="h-5 w-5" /> : state === 'complete' ? <CheckCircle2 className="h-5 w-5" /> : <KeyRound className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm text-on-surface-variant">{mode === 'invite' ? 'Q-Ops Agent invite' : 'Q-Ops Agent password reset'}</p>
            <h1 className="text-2xl font-semibold tracking-tight">{mode === 'invite' ? 'Set your password' : 'Choose a new password'}</h1>
          </div>
        </div>

        {state === 'loading' ? (
          <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Verifying authentication link
          </div>
        ) : null}

        {state === 'ready' || state === 'submitting' ? (
          <form className="space-y-5" onSubmit={submit}>
            <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm">
              <p className="text-on-surface-variant">Account</p>
              <p className="mt-1 font-medium text-on-surface">{email || 'Invited user'}</p>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-on-surface-variant">Password</label>
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                autoComplete="new-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold uppercase text-on-surface-variant">Confirm Password</label>
              <input
                className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                autoComplete="new-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                minLength={8}
              />
              {passwordError ? <p className="pt-1 text-xs font-medium text-error">{passwordError}</p> : null}
            </div>
            <button
              disabled={state === 'submitting' || Boolean(passwordError) || !password || !confirmPassword}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === 'submitting' ? 'Finishing setup...' : mode === 'invite' ? 'Finish Account Setup' : 'Update Password'}
            </button>
          </form>
        ) : null}

        {state === 'error' ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">{message}</div>
            <button onClick={() => navigate('/', { replace: true })} className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-on-primary">
              Back to Login
            </button>
          </div>
        ) : null}
      </main>
    </div>
  )
}
