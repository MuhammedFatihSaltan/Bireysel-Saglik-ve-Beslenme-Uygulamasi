import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'vitesupabaseurl';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'vitesupabaseanonkey';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
