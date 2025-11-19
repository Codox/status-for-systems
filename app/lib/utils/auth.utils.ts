const TOKEN_KEY = 'jwt_token';

/**
 * Store JWT token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

/**
 * Retrieve JWT token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

/**
 * Remove JWT token from localStorage (logout)
 */
export function removeAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Validate JWT token by checking if it exists and is not expired
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) {
    return false;
  }

  try {
    // Parse JWT token (format: header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Decode payload (base64)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token has expiry and if it's still valid
    if (payload.exp) {
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      return currentTime < expiryTime;
    }

    // If no expiry, consider token valid (not recommended in production)
    return true;
  } catch (error) {
    console.error('Error validating token:', error);
    return false;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  return isTokenValid(token);
}
