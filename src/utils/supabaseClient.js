// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
