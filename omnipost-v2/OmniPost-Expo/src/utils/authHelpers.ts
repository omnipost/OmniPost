import type { User } from '../types';

interface AuthPayload {
  user: User;
  accessToken: string;
}

export function parseAuthResponse(res: { data?: { data?: AuthPayload; success?: boolean } }): AuthPayload {
  const data = res.data?.data;
  if (!data?.user || !data?.accessToken) {
    throw new Error('Invalid auth response from server');
  }
  return {
    user: {
      ...data.user,
      createdAt: data.user.createdAt || new Date().toISOString(),
    },
    accessToken: data.accessToken,
  };
}

export function getApiError(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { error?: string } }; message?: string };
  return err?.response?.data?.error || err?.message || fallback;
}
