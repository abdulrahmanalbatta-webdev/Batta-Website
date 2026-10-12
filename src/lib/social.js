// الدخول بحساب Google أو Facebook: نافذة المزوّد تعطي access token، واللوحة تتحقق منه (POST auth/social/{provider}).
// السكربتات تُحمَّل مسبقاً عند فتح صفحة الدخول، لأن المتصفح يحجب النافذة المنبثقة إن لم تُفتح مباشرة من النقرة.
const scripts = {}

function loadScript(src) {
  scripts[src] ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = true
    script.onload = resolve
    script.onerror = () => {
      delete scripts[src]
      reject(new Error('script'))
    }
    document.head.append(script)
  })
  return scripts[src]
}

let facebookAppId
export function prepareSocial({ google_client_id: googleId, facebook_app_id: facebookId } = {}) {
  if (googleId) loadScript('https://accounts.google.com/gsi/client').catch(() => {})
  if (facebookId && facebookAppId !== facebookId) {
    loadScript('https://connect.facebook.net/en_US/sdk.js')
      .then(() => {
        window.FB.init({ appId: facebookId, version: 'v19.0', cookie: false, xfbml: false })
        facebookAppId = facebookId
      })
      .catch(() => {})
  }
}

const NOT_READY = 'خدمة تسجيل الدخول لم تجهز بعد. انتظر لحظة وحاول مجدداً، أو عطّل مانع الإعلانات لهذه الصفحة.'

// null when the visitor closes the window
export function googleToken(clientId) {
  return new Promise((resolve, reject) => {
    const oauth = window.google?.accounts?.oauth2
    if (!oauth) return reject(new Error(NOT_READY))
    oauth
      .initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: (response) => (response.access_token ? resolve(response.access_token) : resolve(null)),
        error_callback: () => resolve(null),
      })
      .requestAccessToken()
  })
}

export function facebookToken() {
  return new Promise((resolve, reject) => {
    if (!window.FB || !facebookAppId) return reject(new Error(NOT_READY))
    window.FB.login((response) => resolve(response.authResponse?.accessToken ?? null), { scope: 'email' })
  })
}
