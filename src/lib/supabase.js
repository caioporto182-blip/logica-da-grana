import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://mxdofgjgemwglvhepftc.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14ZG9mZ2pnZW13Z2x2aGVwZnRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3MjQ1NTAsImV4cCI6MjA4MDMwMDU1MH0.GxTumKTJtE-WUFfxuQ64_NnoHo9l8TyJ259nVrd1bYo"

export const supabase = createClient(supabaseUrl, supabaseKey)
