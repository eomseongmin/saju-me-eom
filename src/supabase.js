import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const hasSupabaseEnv = Boolean(supabaseUrl && supabaseKey)

export const supabase = hasSupabaseEnv
  ? createClient(supabaseUrl, supabaseKey)
  : null
