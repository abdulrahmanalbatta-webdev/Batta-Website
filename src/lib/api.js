// الاتصال بلوحة التحكم (Laravel): كل بيانات الموقع من /api/v1
// العنوان من VITE_API_URL في ملف .env (انظر .env.example)
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '')
const TOKEN_KEY = 'batta.token'

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || (status === 0 ? 'تعذّر الاتصال بالخادم، تحقق من الإنترنت وحاول مجدداً.' : 'حدث خطأ غير متوقع، حاول مجدداً.'))
    this.status = status
    // أخطاء الحقول من Laravel: { email: ['...'] } → { email: '...' }
    this.errors = Object.fromEntries(Object.entries(body?.errors || {}).map(([key, list]) => [key, list[0]]))
  }
}

export const token = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },
  set: (value) => {
    try {
      value ? localStorage.setItem(TOKEN_KEY, value) : localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* private mode: the sign-in lasts until the tab closes */
    }
  },
}

async function request(method, path, body) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const bearer = token.get()
  if (bearer) headers.Authorization = `Bearer ${bearer}`

  let response
  try {
    response = await fetch(`${BASE}/${path.replace(/^\//, '')}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new ApiError(0)
  }

  if (response.status === 204) return null
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    // انتهت صلاحية الدخول أو أُلغي: نعامل الزائر كضيف
    if (response.status === 401 && bearer) token.set(null)
    throw new ApiError(response.status, data)
  }
  return data
}

export const api = {
  get: (path, query) => request('GET', query ? `${path}?${new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== ''))}` : path),
  post: (path, body = {}) => request('POST', path, body),
  put: (path, body = {}) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
}
