// الاتصال بلوحة التحكم (Laravel): كل بيانات الموقع من /api/v1
// العنوان من VITE_API_URL في ملف .env (انظر .env.example)
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '')
const TOKEN_KEY = 'batta.token'

// status 0: no answer at all; 408: no answer in time (the free host may be waking up); 503: a deploy in progress
const MESSAGES = {
  0: 'تعذّر الاتصال بالخادم، تحقق من الإنترنت وحاول مجدداً.',
  408: 'الخادم يستغرق وقتاً أطول من المعتاد في الرد، حاول مجدداً بعد لحظات.',
  413: 'الملف أكبر من الحد المسموح، جرّب ملفاً أصغر.',
  503: 'نحدّث الموقع الآن، حاول مجدداً بعد دقيقة.',
}
const TIMEOUT = 20000

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || MESSAGES[status] || 'حدث خطأ غير متوقع، حاول مجدداً.')
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
  // a FormData body (a file upload) sets its own multipart Content-Type
  const isForm = body instanceof FormData
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json'
  const bearer = token.get()
  if (bearer) headers.Authorization = `Bearer ${bearer}`

  let response
  try {
    response = await fetch(`${BASE}/${path.replace(/^\//, '')}`, { method, headers, body: body === undefined || isForm ? body : JSON.stringify(body), signal: AbortSignal.timeout(TIMEOUT) })
  } catch (err) {
    throw new ApiError(err?.name === 'TimeoutError' ? 408 : 0)
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
