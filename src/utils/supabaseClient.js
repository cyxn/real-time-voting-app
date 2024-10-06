// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
