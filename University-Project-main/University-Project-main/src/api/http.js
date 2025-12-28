// Resolve API base URL with robust local dev fallback
// Priority: env var -> localhost:5050 for dev -> relative "/api" for same-origin deployments
const isLoopbackHost = (hostname) => hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';

const resolveApiBaseUrl = () => {
  const envBase = process.env.REACT_APP_API_BASE_URL;

  // In the browser we can adapt based on where the app is being served from.
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol || 'http:';
    const appPort = window.location.port;

    // If the app is being served from a different port (e.g. `serve -s build -l 3001` or CRA dev server),
    // but env points at same-origin `/api`, then `/api` will be answered by the frontend server (HTML) and
    // our client will throw "Unexpected non-JSON response".
    // Fix by targeting the backend on 5050 at the same hostname.
    if (envBase === '/api' && appPort && appPort !== '5050') {
      return `${protocol}//${hostname}:5050/api`;
    }

    // If env points to loopback but we're opened via a LAN hostname/IP, loopback will be wrong
    // on other devices. Use the current hostname + backend port.
    if (
      envBase &&
      !isLoopbackHost(hostname) &&
      (envBase.includes('127.0.0.1') || envBase.includes('localhost'))
    ) {
      return `${protocol}//${hostname}:5050/api`;
    }

    // If no env set, default to loopback for loopback hosts, otherwise use hostname:5050.
    if (!envBase) {
      if (isLoopbackHost(hostname)) return 'http://127.0.0.1:5050/api';
      return `${protocol}//${hostname}:5050/api`;
    }
  }

  // Non-browser / default
  return envBase || '/api';
};

export const API_BASE_URL = resolveApiBaseUrl();

export const API_ORIGIN = (() => {
  // If API_BASE_URL is relative (e.g. "/api"), origin should be "" so "/uploads/..." works.
  if (API_BASE_URL.startsWith('/')) return '';
  return API_BASE_URL.replace(/\/api\/?$/, '');
})();

const getAuthToken = () => {
  try {
    return localStorage.getItem('auth_token');
  } catch {
    return null;
  }
};

export async function httpRequest(path, { method = 'GET', body, headers = {} } = {}) {
  const token = getAuthToken();

  const isFormData =
    typeof FormData !== 'undefined' &&
    body &&
    body instanceof FormData;
  const isBodyRaw =
    typeof body === 'string' ||
    (typeof Blob !== 'undefined' && body instanceof Blob) ||
    (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer);

  const shouldSendJson = body != null && !isFormData && !isBodyRaw;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(shouldSendJson ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      ...(body != null
        ? {
            body: shouldSendJson ? JSON.stringify(body) : body,
          }
        : {}),
    });
  } catch (networkErr) {
    const err = new Error('Unable to reach the server. Please check your connection or try again later.');
    err.cause = networkErr;
    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : null;

  if (!res.ok) {
    const message = data?.error || data?.message || `Request failed with ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  // Our API is expected to return JSON for all successful requests.
  // If we got HTML/text here, it's almost always a misconfigured base URL
  // (e.g. REACT_APP_API_BASE_URL not set in production, or running web on 127.0.0.1
  // while the dev fallback only matched "localhost").
  if (!isJson) {
    const err = new Error(
      'Unexpected non-JSON response from API. Check REACT_APP_API_BASE_URL (or ensure the backend is serving /api on the same origin).'
    );
    err.status = res.status;
    err.data = { contentType };
    throw err;
  }

  return data;
}
