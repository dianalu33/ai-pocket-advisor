'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqvkiamgovxcbpxizlev.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdmtpYW1nb3Z4Y2JweGl6bGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MzY2ODMsImV4cCI6MjEwMjIxMjY4M30.pFqKQcPJ857nXMRe46ZzVCAhr4euChIisFg0s8vb9bQ'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

type UserProfile = {
  id: string
  created_at: string
  user_id: string
  name: string
  email: string
  monthly_income: number
  currency: string
}

type UserExpense = {
  id: string
  created_at: string
  user_id: string
  expense_name: string
  amount: number
  category: string
  is_recurring: boolean
}

export default function AdminPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [expenses, setExpenses] = useState<UserExpense[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profiles' | 'expenses'>('profiles')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      
      const [profilesRes, expensesRes] = await Promise.all([
        supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('user_expenses').select('*').order('created_at', { ascending: false })
      ])

      if (profilesRes.data) setProfiles(profilesRes.data)
      if (expensesRes.data) setExpenses(expensesRes.data)
      
      setLoading(false)
    }

    fetchData()
  }, [])

  const totalIncome = profiles.reduce((sum, p) => sum + (p.monthly_income || 0), 0)
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f0f0f', 
      color: '#fff',
      padding: '40px',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>🎯 Admin Dashboard</h1>
        <p style={{ color: '#888', marginBottom: '32px' }}>
          AI Pocket Advisor - User Data
        </p>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
          <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '12px' }}>
            <p style={{ color: '#888', fontSize: '14px' }}>Total Users</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{profiles.length}</p>
          </div>
          <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '12px' }}>
            <p style={{ color: '#888', fontSize: '14px' }}>Total Expenses Logged</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{expenses.length}</p>
          </div>
          <div style={{ background: '#1a1a1a', padding: '24px', borderRadius: '12px' }}>
            <p style={{ color: '#888', fontSize: '14px' }}>Total Monthly Income</p>
            <p style={{ fontSize: '36px', fontWeight: 'bold' }}>${totalIncome.toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <button
            onClick={() => setActiveTab('profiles')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'profiles' ? '#6366f1' : '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            👥 User Profiles ({profiles.length})
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'expenses' ? '#6366f1' : '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            💰 Expenses ({expenses.length})
          </button>
        </div>

        {/* Data Table */}
        {loading ? (
          <p>Loading...</p>
        ) : activeTab === 'profiles' ? (
          <div style={{ background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#252525' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Monthly Income</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Currency</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile) => (
                  <tr key={profile.id} style={{ borderTop: '1px solid #252525' }}>
                    <td style={{ padding: '16px' }}>{profile.name}</td>
                    <td style={{ padding: '16px', color: '#888' }}>{profile.email}</td>
                    <td style={{ padding: '16px' }}>${profile.monthly_income?.toLocaleString()}</td>
                    <td style={{ padding: '16px' }}>{profile.currency}</td>
                    <td style={{ padding: '16px', color: '#888' }}>
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {profiles.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      No profiles yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#252525' }}>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Expense</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Category</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Amount</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Recurring</th>
                  <th style={{ padding: '16px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} style={{ borderTop: '1px solid #252525' }}>
                    <td style={{ padding: '16px' }}>{expense.expense_name}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        background: '#252525', 
                        padding: '4px 12px', 
                        borderRadius: '20px',
                        fontSize: '14px'
                      }}>
                        {expense.category}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>${expense.amount?.toLocaleString()}</td>
                    <td style={{ padding: '16px' }}>
                      {expense.is_recurring ? '✓ Yes' : 'No'}
                    </td>
                    <td style={{ padding: '16px', color: '#888' }}>
                      {new Date(expense.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                      No expenses yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
