import { useCallback, useEffect, useRef, useState } from 'react';
import type { Note, SaveStatus } from '../types';

interface Options {
  initialContent: string;
  save: (content: string) => Promise<Note>;
  delay?: number;
}

export function useAutoSave({ initialContent, save, delay = 5000 }: Options) {
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<string | undefined>();
  const contentRef = useRef(initialContent);
  const savedRef = useRef(initialContent);
  const timerRef = useRef<number | undefined>();

  useEffect(() => {
    setContent(initialContent);
    contentRef.current = initialContent;
    savedRef.current = initialContent;
    setStatus('idle');
  }, [initialContent]);

  const flush = useCallback(async () => {
    window.clearTimeout(timerRef.current);
    const nextContent = contentRef.current;
    if (nextContent === savedRef.current) return;
    setStatus('saving');
    try {
      const note = await save(nextContent);
      savedRef.current = note.content;
      setLastSavedAt(note.lastEditedAt);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }, [save]);

  const updateContent = useCallback((next: string) => {
    setContent(next);
    contentRef.current = next;
    setStatus('editing');
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void flush();
    }, delay);
  }, [delay, flush]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  return { content, flush, lastSavedAt, setContent: updateContent, status };
}
