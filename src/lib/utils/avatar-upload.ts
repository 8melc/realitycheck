import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * Validates an uploaded avatar file
 */
export function validateAvatarFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Bild zu groß (max 2MB)' };
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Nur JPG, PNG oder WEBP erlaubt' };
  }

  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: 'Ungültige Dateierweiterung' };
  }

  return { valid: true };
}

/**
 * Gets file extension from MIME type or filename
 */
function getFileExtension(file: File): string {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension && ALLOWED_EXTENSIONS.includes(extension)) {
    return extension;
  }

  // Fallback to MIME type mapping
  const mimeMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return mimeMap[file.type] || 'jpg';
}

/**
 * Deletes all avatar files for a user from Supabase Storage
 */
export async function deleteAvatar(userId: string): Promise<void> {
  try {
    const supabase = await createClient();

    // List all files in the user's avatar directory
    const { data: files, error: listError } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (listError) {
      // If directory doesn't exist or is empty, that's fine
      if (listError.message?.includes('not found') || listError.message?.includes('No such file')) {
        return;
      }
      throw listError;
    }

    if (!files || files.length === 0) {
      return;
    }

    // Delete all files in the user's directory
    const filePaths = files.map((file) => `${userId}/${file.name}`);
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove(filePaths);

    if (deleteError) {
      throw deleteError;
    }
  } catch (error) {
    console.error('[avatar-upload] Error deleting avatar:', error);
    throw new Error('Fehler beim Löschen des Avatars');
  }
}

/**
 * Uploads an avatar file to Supabase Storage
 * @param file - The file to upload
 * @param userId - The user ID
 * @returns The public URL of the uploaded avatar
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  try {
    // Validate file
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Ungültige Datei');
    }

    const supabase = await createClient();

    // Delete old avatar first
    await deleteAvatar(userId);

    // Generate unique filename
    const extension = getFileExtension(file);
    const timestamp = Date.now();
    const filePath = `${userId}/${timestamp}.${extension}`;

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    if (!data) {
      throw new Error('Upload fehlgeschlagen');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      throw new Error('Konnte öffentliche URL nicht generieren');
    }

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('[avatar-upload] Error uploading avatar:', error);
    throw new Error(error.message || 'Fehler beim Hochladen des Avatars');
  }
}

