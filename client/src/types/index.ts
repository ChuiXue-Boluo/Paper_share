export interface Field {
  id: number;
  name: string;
  description: string;
  paperCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Paper {
  id: number;
  title: string;
  authors: string;
  year?: number | null;
  source: string;
  topic: string;
  abstract: string;
  fieldId: number;
  fieldName?: string;
  fieldIds: number[];
  fieldNames: string[];
  fields: Field[];
  fileSize?: number;
  uploaderName: string;
  overviewPreview?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Note {
  id: number;
  paperId: number;
  content: string;
  lastEditedAt: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaperListResponse {
  field: Field;
  papers: Paper[];
  total: number;
}

export interface UploadPaperPayload {
  title: string;
  authors?: string;
  year?: string;
  source?: string;
  topic?: string;
  uploaderName: string;
  fieldIds: number[];
  fieldNames?: string[];
  abstract?: string;
  file: File;
}

export interface UpdatePaperPayload {
  title: string;
  source?: string;
  topic?: string;
  uploaderName?: string;
  fieldIds?: number[];
  fieldNames?: string[];
}

export interface PaperOptions {
  venues: string[];
  topics: string[];
}

export type SaveStatus = 'idle' | 'editing' | 'saving' | 'saved' | 'error';
