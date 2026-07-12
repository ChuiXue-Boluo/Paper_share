import { apiClient } from './client';
import type { Paper, PaperListResponse, PaperOptions, UpdatePaperPayload, UploadPaperPayload } from '../types';

export async function fetchFieldPapers(fieldId: string | number, params?: { search?: string; sort?: string }): Promise<PaperListResponse> {
  const { data } = await apiClient.get<PaperListResponse>(`/fields/${fieldId}/papers`, { params });
  return data;
}

export async function fetchPaper(id: string | number): Promise<Paper> {
  const { data } = await apiClient.get<Paper>(`/papers/${id}`);
  return data;
}

export async function fetchPaperOptions(fieldId: string | number): Promise<PaperOptions> {
  const { data } = await apiClient.get<PaperOptions>(`/fields/${fieldId}/paper-options`);
  return data;
}

export async function fetchGlobalPaperOptions(): Promise<PaperOptions> {
  const { data } = await apiClient.get<PaperOptions>('/papers/options/list');
  return data;
}

export async function uploadPaper(fieldId: string | number | null, payload: UploadPaperPayload): Promise<Paper> {
  const form = new FormData();
  form.append('file', payload.file);
  form.append('title', payload.title);
  form.append('fieldIds', JSON.stringify(payload.fieldIds));
  if (payload.fieldNames?.length) form.append('fieldNames', JSON.stringify(payload.fieldNames));
  if (payload.authors) form.append('authors', payload.authors);
  if (payload.year) form.append('year', payload.year);
  if (payload.source) form.append('source', payload.source);
  if (payload.topic) form.append('topic', payload.topic);
  form.append('uploaderName', payload.uploaderName);
  if (payload.abstract) form.append('abstract', payload.abstract);
  const url = fieldId ? `/fields/${fieldId}/papers` : '/papers';
  const { data } = await apiClient.post<Paper>(url, form);
  return data;
}

export async function updatePaper(paperId: string | number, payload: UpdatePaperPayload): Promise<Paper> {
  const { data } = await apiClient.put<Paper>(`/papers/${paperId}`, payload);
  return data;
}

export function paperDownloadUrl(paperId: string | number): string {
  return `/api/papers/${paperId}/download`;
}
