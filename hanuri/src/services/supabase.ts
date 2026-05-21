import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let hasWarnedAboutMissingConfig = false;

function warnMissingSupabaseConfig() {
  if (hasWarnedAboutMissingConfig) return;
  hasWarnedAboutMissingConfig = true;
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY is missing. Remote auth and sync are disabled; continuing in local guest mode.'
  );
}

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

if (!isSupabaseConfigured) {
  warnMissingSupabaseConfig();
}
