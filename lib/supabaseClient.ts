import { createClient } from '@supabase/supabase-js'

console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log("SUPABASE_KEY:", process.env.NEXT_PUBLIC_SUPABASE_KEY)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY as string

export const supabase = createClient(supabaseUrl, supabaseKey) 