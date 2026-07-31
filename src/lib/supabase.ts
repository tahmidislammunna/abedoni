import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MediaAsset } from '../data/appSettings';

const supabaseUrl = 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  'https://ybxquqshnghsdosqiqiu.supabase.co';

const supabaseAnonKey = 
  (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlieHF1cXNobmdoc2Rvc3FpcWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ5NjgxMTUsImV4cCI6MjEwMDU0NDExNX0._kV8KqLLqN2p6QzM4wzj4Jkc5_wKlP_-qozJsSVi75c';

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export function generateCleanSlug(fileName: string): string {
  if (!fileName) return 'asset';
  const lastDot = fileName.lastIndexOf('.');
  const nameWithoutExt = lastDot > 0 ? fileName.substring(0, lastDot) : fileName;
  const slug = nameWithoutExt
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'asset';
}

export const ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  'image/gif'
];

export const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.gif'];

export function isValidImageType(file: File): boolean {
  if (file.type && ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) return true;
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  return ALLOWED_EXTENSIONS.includes(ext);
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function optimizeImageFile(file: File): Promise<Blob | File> {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (ext === '.svg' || ext === '.ico' || file.type.includes('svg') || file.type.includes('icon')) {
    return file;
  }

  if (file.size < 150 * 1024) return file;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        0.88
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

export async function uploadToBrandStorage(
  file: File,
  customSlug?: string,
  onProgress?: (progress: number) => void
): Promise<MediaAsset> {
  if (!isValidImageType(file)) {
    throw new Error('অনুমোদিত ফাইল ফরম্যাট: PNG, JPG, JPEG, WEBP, SVG, ICO');
  }

  onProgress?.(15);
  const cleanSlug = customSlug ? generateCleanSlug(customSlug) : generateCleanSlug(file.name);
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase() || '.png';
  const timestamp = Date.now();
  const fileName = `${cleanSlug}-${timestamp}${ext}`;

  onProgress?.(40);
  const optimizedBlob = await optimizeImageFile(file);
  onProgress?.(60);

  try {
    const { data, error } = await supabase.storage
      .from('brand-assets')
      .upload(fileName, optimizedBlob, {
        cacheControl: '31536000',
        upsert: true,
        contentType: file.type || 'image/png'
      });

    onProgress?.(85);

    if (!error && data) {
      const { data: publicData } = supabase.storage
        .from('brand-assets')
        .getPublicUrl(fileName);

      const publicUrl = publicData.publicUrl;

      onProgress?.(100);
      return {
        id: `media-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        slug: cleanSlug,
        url: publicUrl,
        size: file.size,
        type: file.type || 'image/png',
        createdAt: new Date().toISOString(),
        storagePath: fileName,
      };
    } else {
      console.warn('Storage bucket message:', error?.message);
    }
  } catch (err) {
    console.warn('Supabase storage upload error, using fallback:', err);
  }

  onProgress?.(90);
  const dataUrl = await fileToDataUrl(file);
  onProgress?.(100);

  return {
    id: `media-${timestamp}-${Math.random().toString(36).substring(2, 7)}`,
    name: file.name,
    slug: cleanSlug,
    url: dataUrl,
    size: file.size,
    type: file.type || 'image/png',
    createdAt: new Date().toISOString(),
  };
}

export async function deleteBrandStorageAsset(asset: MediaAsset): Promise<boolean> {
  if (asset.storagePath) {
    try {
      await supabase.storage.from('brand-assets').remove([asset.storagePath]);
    } catch (e) {
      console.warn('Storage removal notice:', e);
    }
  }
  return true;
}

export async function fetchAppSettingsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', 'main')
      .maybeSingle();

    if (!error && data?.settings) {
      return data.settings;
    }
  } catch (err) {
    console.warn('Failed to fetch app settings from Supabase:', err);
  }
  return null;
}

export async function saveAppSettingsToSupabase(newSettings: any) {
  try {
    const { data } = await supabase
      .from('app_settings')
      .select('settings')
      .eq('id', 'main')
      .maybeSingle();

    const current = (data && data.settings) || {};
    const updated = { ...current, ...newSettings };

    await supabase
      .from('app_settings')
      .upsert({ id: 'main', settings: updated, updated_at: new Date().toISOString() });

    return updated;
  } catch (err) {
    console.error('Failed to save app settings to Supabase:', err);
  }
  return newSettings;
}

