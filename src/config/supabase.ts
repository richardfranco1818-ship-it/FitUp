import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
 
const supabaseUrl = 'https://zhzruarrxwnugsufvgdd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoenJ1YXJyeHdudWdzdWZ2Z2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NzIwNjgsImV4cCI6MjA5MzE0ODA2OH0.l802_pwpSHQV0SIEgb4W2Fg0-BuGaCC_i1ljQVNdpfw';
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
 
