import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = "https://ccvjcnpaynefigpvcyfj.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjdmpjbnBheW5lZmlncHZjeWZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NDIzMTIsImV4cCI6MjA2NzAxODMxMn0.DG4hwZRPyQ_xQCPxxlJgckHxlRplbsVBlxSgX_2xabc";
// const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// console.log((process.env.VITE_SUPABASE_URL));

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
