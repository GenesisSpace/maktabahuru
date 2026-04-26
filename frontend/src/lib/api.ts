import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function coverUrl(path: string | null | undefined): string {
  if (!path) return '/placeholder-cover.svg';
  if (path.startsWith('http')) return path;
  return '/placeholder-cover.svg';
}

export async function openMaterial(id: string, type: string): Promise<void> {
  try {
    const r = await api.get(`/materials/${id}/download`);
    const url = r.data?.url;
    if (!url) return;

    if (type === 'book' || type === 'story') {
      // Open PDF in browser's built-in PDF viewer
      const viewer = `/read?url=${encodeURIComponent(url)}`;
      window.open(viewer, '_blank');
    } else {
      // Videos, audio — open directly
      window.open(url, '_blank');
    }
  } catch {
    alert('Could not open file. Please try again.');
  }
}