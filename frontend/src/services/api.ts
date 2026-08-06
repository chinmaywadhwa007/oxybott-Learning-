const API_BASE = import.meta.env.VITE_API_URL || 'https://oxybott-learning.onrender.com/api';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('oxybott_token') || localStorage.getItem('acecode_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        status: res.status,
        error: data.error || data.message || 'An unexpected error occurred.',
      };
    }

    return {
      status: res.status,
      data: data as T,
      message: data.message,
    };
  } catch (err: any) {
    console.error(`[API Error] Request to ${endpoint} failed:`, err);
    return {
      status: 500,
      error: 'Network connection failed. Is the backend server running?',
    };
  }
}
