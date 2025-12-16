import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Export a default instance for backward compatibility
export const supabase = createSupabaseBrowserClient();

