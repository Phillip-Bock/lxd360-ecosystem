'use client';

import { useCallback, useState } from 'react';
import type { AIPersonaId } from './persona-config';

interface UploadUrlResponse {
  uploadUrl: string;
  publicUrl: string;
  expiresAt: string;
  maxSize: number;
  personaId: string;
}

export interface CharacterInfo {
  personaId: AIPersonaId;
  hasCustom: boolean;
  size?: number;
  updated?: string;
  publicUrl?: string;
}

interface UseCharacterManagementOptions {
  getAuthToken: () => Promise<string>;
}

export function useCharacterManagement({ getAuthToken }: UseCharacterManagementOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  /**
   * Fetch list of all characters with custom status
   */
  const listCharacters = useCallback(async (): Promise<CharacterInfo[]> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/tenant/characters', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to list characters');
      }

      const { characters } = await response.json();
      return characters;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to list characters';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  /**
   * Upload a custom character model
   */
  const uploadCharacter = useCallback(
    async (personaId: AIPersonaId, file: File): Promise<string> => {
      setIsLoading(true);
      setError(null);
      setUploadProgress(0);

      try {
        const token = await getAuthToken();

        // Step 1: Get signed upload URL
        const urlResponse = await fetch('/api/tenant/characters/upload-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            personaId,
            fileName: file.name,
            contentType: file.type || 'application/octet-stream',
          }),
        });

        if (!urlResponse.ok) {
          const data = await urlResponse.json();
          throw new Error(data.error || 'Failed to get upload URL');
        }

        const { uploadUrl, publicUrl, maxSize } = (await urlResponse.json()) as UploadUrlResponse;

        // Validate file size
        if (file.size > maxSize) {
          throw new Error(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`);
        }

        // Step 2: Upload file to GCS
        setUploadProgress(10);

        const uploadResponse = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type || 'application/octet-stream',
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload file to storage');
        }

        setUploadProgress(100);
        return publicUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthToken],
  );

  /**
   * Delete a custom character
   */
  const deleteCharacter = useCallback(
    async (personaId: AIPersonaId): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getAuthToken();
        const response = await fetch(`/api/tenant/characters?personaId=${personaId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete character');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Delete failed';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [getAuthToken],
  );

  return {
    listCharacters,
    uploadCharacter,
    deleteCharacter,
    isLoading,
    error,
    uploadProgress,
    clearError: () => setError(null),
  };
}
