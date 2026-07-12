import { apiClient } from './client';
import type { Note } from '../types';

export async function fetchNote(paperId: string | number): Promise<Note> {
  const { data } = await apiClient.get<Note>(`/papers/${paperId}/note`);
  return data;
}

export async function saveNote(paperId: string | number, content: string): Promise<Note> {
  const { data } = await apiClient.put<Note>(`/papers/${paperId}/note`, { content });
  return data;
}

export async function uploadNoteImage(paperId: string | number, file: File): Promise<{ url: string }> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<{ url: string }>(`/papers/${paperId}/note/image`, form);
  return data;
}
