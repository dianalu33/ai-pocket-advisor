import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqvkiamgovxcbpxizlev.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdmtpYW1nb3Z4Y2JweGl6bGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzY2ODMsImV4cCI6MjEwMjIxMjY4M30.pFqKQcPJ857nXMRe46ZzVCAhr4euChIisFg0s8vb9bQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to save expense to database
export async function saveExpenseToDatabase(expense: {
  user_id: string
  expense_name: string
  amount: number
  category: string
  is_recurring?: boolean
}) {
  const { data, error } = await supabase
    .from('user_expenses')
    .insert([expense])
  
  if (error) {
    console.error('Error saving expense:', error)
    return { success: false, error }
  }
  return { success: true, data }
}

// Helper to save user profile to database
export async function saveProfileToDatabase(profile: {
  user_id: string
  name: string
  email: string
  monthly_income: number
  currency: string
}) {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert([profile], { onConflict: 'user_id' })
  
  if (error) {
    console.error('Error saving profile:', error)
    return { success: false, error }
  }
  return { success: true, data }
}

// Helper to get all expenses (for admin)
export async function getAllExpenses() {
  const { data, error } = await supabase
    .from('user_expenses')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching expenses:', error)
    return { success: false, error, data: [] }
  }
  return { success: true, data }
}

// Helper to get all profiles (for admin)
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching profiles:', error)
    return { success: false, error, data: [] }
  }
  return { success: true, data }
}
