import { createClient } from '@supabase/supabase-js'

// We will paste the real keys here in a minute
const supabaseUrl = 'https://qqhixpqaoyjhrngjcrnt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxaGl4cHFhb3lqaHJuZ2pjcm50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MDU2MTcsImV4cCI6MjA4MzI4MTYxN30.LbpymMGWNj2Hrv03eHIHq-YXFSzvD3OAkO--hVPka1c'

export const supabase = createClient(supabaseUrl, supabaseKey)