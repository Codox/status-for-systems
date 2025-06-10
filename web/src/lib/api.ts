export async function fetchWithAuth(path: string, options: RequestInit = {}) {
  const user = process.env.NEXT_PUBLIC_BASIC_AUTH_USER;
  const password = process.env.NEXT_PUBLIC_BASIC_AUTH_PASSWORD;
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('API URL is not configured (NEXT_PUBLIC_API_URL)');
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (user && password) {
    const credentials = btoa(`${user}:${password}`);
    headers['Authorization'] = `Basic ${credentials}`;
  }

  const url = `${apiUrl}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
  }

  return response;
} 