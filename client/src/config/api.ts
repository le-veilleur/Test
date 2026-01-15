export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const PROVIDERS = {
  GMAIL: 'gmail',
  OUTLOOK: 'outlook',
  INSTAGRAM: 'instagram',
  LINKEDIN: 'linkedin',
} as const;

export type Provider = typeof PROVIDERS[keyof typeof PROVIDERS];
