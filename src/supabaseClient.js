import { createClient } from '@supabase/supabase-js'


const supabaseUrl = 'https://sjdfgsfispnjzfiyyepd.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqZGZnc2Zpc3BuanpmaXl5ZXBkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY5NDcwNzYsImV4cCI6MjA0MjUyMzA3Nn0.29-X8w-bkcHH59yh76rfefVw7JepTeQ3B6BJPh5eWh8'


export const supabase = createClient(supabaseUrl, supabaseKey)