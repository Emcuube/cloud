const STORAGE_KEY = 'cognitoSession';
const SCOPE = ['openid', 'email', 'profile'].join(' ');

export interface CognitoSession {
  accessToken: string;
  idToken: string;
  tokenType: string;
  expiresAt: number;
  issuedAt: number;
  state?: string | null;
}

export interface TokenFragment {
  accessToken: string;
  idToken: string;
  expiresIn: number;
  tokenType: string;
  state?: string | null;
}

const getBaseConfig = () => {
  const domain = import.meta.env.VITE_COGNITO_DOMAIN?.replace(/\/$/, '');
  const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
  const redirectUri =
    import.meta.env.VITE_COGNITO_REDIRECT_URI ||
    (typeof window !== 'undefined' ? `${window.location.origin}/callback` : '');
  const logoutRedirectUri =
    import.meta.env.VITE_COGNITO_LOGOUT_URI ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  return { domain, clientId, redirectUri, logoutRedirectUri };
};

const ensureConfig = () => {
  const config = getBaseConfig();
  if (!config.domain || !config.clientId) {
    throw new Error(
      'Missing Cognito configuration. Please set VITE_COGNITO_DOMAIN and VITE_COGNITO_CLIENT_ID.'
    );
  }
  return config;
};

const buildAuthorizeUrl = (state?: string | null): string => {
  const { domain, clientId, redirectUri } = ensureConfig();
  const authorize = new URL(`${domain}/oauth2/authorize`);
  authorize.searchParams.set('client_id', clientId);
  authorize.searchParams.set('response_type', 'token');
  authorize.searchParams.set('redirect_uri', redirectUri);
  authorize.searchParams.set('scope', SCOPE);
  if (state) {
    authorize.searchParams.set('state', state);
  }
  return authorize.toString();
};

const buildLogoutUrl = (): string => {
  const { domain, clientId, logoutRedirectUri } = ensureConfig();
  const logout = new URL(`${domain}/logout`);
  logout.searchParams.set('client_id', clientId);
  logout.searchParams.set('logout_uri', logoutRedirectUri);
  return logout.toString();
};

export const redirectToLogin = (state?: string | null) => {
  window.location.assign(buildAuthorizeUrl(state));
};

export const redirectToLogout = () => {
  clearSession();
  window.location.assign(buildLogoutUrl());
};

export const parseTokensFromHash = (hash: string): TokenFragment | null => {
  if (!hash) return null;
  const params = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
  const accessToken = params.get('access_token');
  const idToken = params.get('id_token');
  const expiresInParam = params.get('expires_in');
  const tokenType = params.get('token_type') ?? 'Bearer';

  if (!accessToken || !idToken || !expiresInParam) {
    return null;
  }

  return {
    accessToken,
    idToken,
    expiresIn: Number(expiresInParam),
    tokenType,
    state: params.get('state'),
  };
};

export const persistSession = (fragment: TokenFragment) => {
  const now = Date.now();
  const session: CognitoSession = {
    accessToken: fragment.accessToken,
    idToken: fragment.idToken,
    tokenType: fragment.tokenType,
    issuedAt: now,
    expiresAt: now + fragment.expiresIn * 1000,
    state: fragment.state,
  };
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
};

export const loadSession = (): CognitoSession | null => {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CognitoSession;
  } catch {
    return null;
  }
};

export const clearSession = () => {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

export const hasValidSession = (): boolean => {
  const session = loadSession();
  if (!session) return false;
  return session.expiresAt > Date.now();
};
