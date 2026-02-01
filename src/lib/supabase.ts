
import { createClient } from '@supabase/supabase-js'

// Provide fallback values during build time to prevent errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Warn if using fallback values in browser
if (typeof window !== 'undefined' && (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
    console.error("Missing Supabase Environment Variables - using placeholder values");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
