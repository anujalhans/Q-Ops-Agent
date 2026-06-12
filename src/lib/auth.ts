export const SUPABASE_URL = 'https://ifnznfspkjayhnooncrv.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_SzDNzUTrzUb7lIBT3AuSvg_UD_jP9Gt'

const SESSION_KEY = 'qops-agent-supabase-session'

export type AuthSession = {
  accessToken: string
  refreshToken: string
  expiresAt: number
  user: {
    id: string
    email?: string
  }
}

type SupabaseTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  expires_at?: number
  user?: {
    id: string
    email?: string
  }
  error?: string
  error_description?: string
  msg?: string
}

type SupabaseUserResponse = {
  id?: string
  email?: string
  error?: string
  error_description?: string
  msg?: string
}

export class TransientAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TransientAuthError'
  }
}

function authHeaders(accessToken?: string) {
  return {
    apikey: SUPABASE_PUBLISHABLE_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_PUBLISHABLE_KEY}`,
    'Content-Type': 'application/json',
  }
}

function getAuthError(data: { error?: string; error_description?: string; msg?: string }, fallback: string) {
  return data.error_description || data.msg || data.error || fallback
}

function isInvalidRefreshTokenError(data: { error?: string; error_description?: string; msg?: string }) {
  const message = getAuthError(data, '').toLowerCase()
  return (
    message.includes('invalid refresh token') ||
    message.includes('refresh token not found') ||
    message.includes('refresh token already used') ||
    message.includes('invalid_grant')
  )
}

async function readAuthJson<T>(res: Response): Promise<T> {
  return (await res.json().catch(() => ({}))) as T
}

function toSession(data: SupabaseTokenResponse): AuthSession {
  if (!data.access_token || !data.refresh_token || !data.user?.id) {
    throw new Error(getAuthError(data, 'Invalid Supabase Auth response'))
  }

  const now = Math.floor(Date.now() / 1000)
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: data.expires_at || now + (data.expires_in || 3600),
    user: {
      id: data.user.id,
      email: data.user.email,
    },
  }
}

async function fetchAuthUser(accessToken: string): Promise<AuthSession['user']> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: authHeaders(accessToken),
  })
  const data = (await res.json()) as SupabaseUserResponse
  if (!res.ok || !data.id) throw new Error(getAuthError(data, 'Unable to read Supabase Auth user'))
  return {
    id: data.id,
    email: data.email,
  }
}

export function getStoredSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as AuthSession) : null
  } catch {
    return null
  }
}

export function storeSession(session: AuthSession) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('qops-agent-auth')
}

export function getAccessToken() {
  return getStoredSession()?.accessToken || null
}

export async function signInWithPassword(email: string, password: string): Promise<AuthSession> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json()) as SupabaseTokenResponse
  if (!res.ok) throw new Error(getAuthError(data, 'Unable to sign in'))
  const session = toSession(data)
  storeSession(session)
  return session
}

export function getAuthCallbackType(hash: string): string {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  return params.get('type') || ''
}

export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ email }),
  })
  const data = (await res.json().catch(() => ({}))) as { error?: string; error_description?: string; msg?: string }
  if (!res.ok) throw new Error(getAuthError(data, 'Unable to send password reset email'))
}

export async function storeSessionFromAuthCallback(hash: string): Promise<AuthSession> {
  const params = new URLSearchParams(hash.replace(/^#/, ''))
  const error = params.get('error_description') || params.get('error')
  if (error) throw new Error(error)

  const accessToken = params.get('access_token') || ''
  const refreshToken = params.get('refresh_token') || ''
  if (!accessToken || !refreshToken) {
    throw new Error('This authentication link is missing a Supabase session. Please request a fresh link.')
  }

  const now = Math.floor(Date.now() / 1000)
  const expiresAt = Number(params.get('expires_at')) || now + Number(params.get('expires_in') || 3600)
  const user = await fetchAuthUser(accessToken)
  const session = {
    accessToken,
    refreshToken,
    expiresAt,
    user,
  }
  storeSession(session)
  return session
}

export async function storeSessionFromInviteCallback(hash: string): Promise<AuthSession> {
  return storeSessionFromAuthCallback(hash)
}

export async function updateCurrentUserPassword(password: string): Promise<void> {
  const token = getAccessToken()
  if (!token) throw new Error('Your password setup session has expired. Please request a fresh link.')

  const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ password }),
  })
  const data = (await res.json()) as SupabaseUserResponse
  if (!res.ok) throw new Error(getAuthError(data, 'Unable to set password'))
}

export async function refreshStoredSession(): Promise<AuthSession | null> {
  const current = getStoredSession()
  if (!current?.refreshToken) return null

  let res: Response
  try {
    res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ refresh_token: current.refreshToken }),
    })
  } catch {
    throw new TransientAuthError('Unable to refresh your login session because the auth service is temporarily unreachable. Please retry in a moment.')
  }

  const data = await readAuthJson<SupabaseTokenResponse>(res)
  if (!res.ok) {
    if ((res.status === 400 || res.status === 401 || res.status === 403) && isInvalidRefreshTokenError(data)) {
      clearSession()
      return null
    }
    throw new TransientAuthError(`Unable to refresh your login session right now (${res.status}). Please retry in a moment.`)
  }

  const session = toSession(data)
  storeSession(session)
  return session
}

export async function getUsableSession(): Promise<AuthSession | null> {
  const session = getStoredSession()
  if (!session) return null

  const expiresSoon = session.expiresAt <= Math.floor(Date.now() / 1000) + 60
  return expiresSoon ? refreshStoredSession() : session
}

export async function signOut() {
  const token = getAccessToken()
  if (token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: 'POST',
      headers: authHeaders(token),
    }).catch(() => undefined)
  }
  clearSession()
}
