import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ldsiipqzybunbnijtuev.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxkc2lpcHF6eWJ1bmJuaWp0dWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NDg4MjEsImV4cCI6MjA5NzAyNDgyMX0.H9dD00-t2p_QZXXWMpczNHAFWkGn0VsVXL5P9PrkAZo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
