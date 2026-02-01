
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Ensure we have keys to prevent runtime errors during build/dev if missing
if (!supabaseUrl || !supabaseAnonKey) {
    // Only throw in browser to allow build to pass if env vars are missing there
    if (typeof window !== 'undefined') {
        console.error("Missing Supabase Environment Variables");
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
