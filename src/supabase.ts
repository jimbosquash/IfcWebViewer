// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yqtyljfeyormtcbqwwam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxdHlsamZleW9ybXRjYnF3d2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE4ODY0MDMsImV4cCI6MjA0NzQ2MjQwM30.-sFOvxZEenWS-E5kuBbGL4NjqwSPQfsmqswau23Tp50';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
