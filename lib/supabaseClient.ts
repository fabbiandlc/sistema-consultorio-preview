import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mpffnwrysmtmuerwtfhh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wZmZud3J5c210bXVlcnd0ZmhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMjc3NzIsImV4cCI6MjA2NjgwMzc3Mn0.fHaZp2ngDRVkTdiuqTn6Njnl1mVboZKCaXE0Lh6QGyc'

export const supabase = createClient(supabaseUrl, supabaseKey) 