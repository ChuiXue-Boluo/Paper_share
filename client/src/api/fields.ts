import { apiClient } from './client';
import type { Field } from '../types';

export async function fetchFields(): Promise<Field[]> {
  const { data } = await apiClient.get<Field[]>('/fields');
  return data;
}

export async function fetchField(id: string | number): Promise<Field> {
  const { data } = await apiClient.get<Field>(`/fields/${id}`);
  return data;
}

export async function createField(payload: { name: string; description?: string }): Promise<Field> {
  const { data } = await apiClient.post<Field>('/fields', payload);
  return data;
}
