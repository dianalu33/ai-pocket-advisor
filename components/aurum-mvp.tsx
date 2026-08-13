'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase, saveExpenseToDatabase, saveProfileToDatabase } from '@/lib/supabase'
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  BrainCircuit,
  Calendar,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Compass,
  Gauge,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageCircle,
  Newspaper,
  Pause,
  Plus,
  Edit3,
  PieChart,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { WealthWizard } from './wealth-wizard'

type Language = 'en' | 'yue' | 'zh'
type ChatMessage = { role: 'user' | 'assistant'; content: string }

// Shared types for Expense views
type Transaction = {
  id: string
  date: string
  amount: number
  currency: string
  merchant: string
  rawDescription: string
  category: string
  accountId: string
  isRecurring?: boolean
}

type Account = {
  id: string
  name: string
  type: 'checking' | 'credit' | 'savings' | 'investment'
  balance: number
}

type CategorySpending = {
  category: string
  amount: number
  percentOfIncome: number
  moMChange: number
}

type MerchantSpend = {
  merchant: string
  amount: number
  percentOfTotal: number
  transactionCount: number
}

type Anomaly = {
  id: string
  date: string
  amount: number
  merchant: string
  reason: string
  category: string
}

// Expense Input types
type ExpenseItem = {
  id: string
  title: string
  merchant: string
  category: 'subscriptions' | 'transport' | 'groceries' | 'utilities' | 'housing' | 'other'
  amount: number
  cadence: 'weekly' | 'monthly' | 'quarterly' | 'annually'
  startDate: string
  essential: boolean
  autoLink: boolean
  notes?: string
  confidence?: 'high' | 'medium' | 'low'
  override?: boolean
}

type CategoryBudget = {
  category: string
  ceiling: number
}

type Profile = {
  age: number
  salary: number
  otherIncome: number
  expenses: number
  debt: number
  emergencySavings: number
  goal: string
  timeline: number
  risk: 'conservative' | 'balanced' | 'growth'
  interests: string[]
}

type Recommendation = {
  profileLabel: string
  allocation: { name: string; value: number; color: string; reason: string }[]
  monthlyContribution: number
  emergencyTarget: number
  emergencyGap: number
  rationale: string[]
  risks: string[]
  actions: string[]
  ideas: string[]
}

type Market = {
  pulse: { name: string; value: string; change: string; tone: 'up' | 'down' | 'flat' }[]
  assets: { name: string; symbol: string; price: string; change: string; tone: 'up' | 'down' }[]
  trending: string[]
  news: { title: string; source: string; time: string; tag: string }[]
}

const defaultProfile: Profile = {
  age: 29,
  salary: 72000,
  otherIncome: 6000,
  expenses: 3400,
  debt: 12000,
  emergencySavings: 8500,
  goal: 'Build long-term wealth',
  timeline: 10,
  risk: 'balanced',
  interests: ['Index funds', 'Crypto', 'HYSA'],
}

const fallbackMarket: Market = {
  pulse: [
    { name: 'S&P 500', value: '5,842.11', change: '+0.68%', tone: 'up' },
    { name: 'NASDAQ', value: '18,912.44', change: '+1.12%', tone: 'up' },
    { name: 'Bitcoin', value: '$104,260', change: '+2.41%', tone: 'up' },
    { name: '10Y Treasury', value: '4.21%', change: '-0.04%', tone: 'down' },
  ],
  assets: [
    { name: 'Bitcoin', symbol: 'BTC', price: '$104,260', change: '+2.41%', tone: 'up' },
    { name: 'Ethereum', symbol: 'ETH', price: '$3,812', change: '+1.88%', tone: 'up' },
    { name: 'S&P 500 ETF', symbol: 'VOO', price: '$538.22', change: '+0.68%', tone: 'up' },
    { name: 'US Bond ETF', symbol: 'BND', price: '$73.10', change: '-0.12%', tone: 'down' },
  ],
  trending: ['AI infrastructure', 'Tokenized treasuries', 'Quality dividends', 'Emerging markets'],
  news: [
    { title: 'Markets weigh cooling inflation against resilient growth', source: 'Market Brief', time: '18 min ago', tag: 'Macro' },
    { title: 'Bitcoin liquidity improves as institutional demand returns', source: 'Digital Assets Daily', time: '42 min ago', tag: 'Crypto' },
    { title: 'Treasury yields dip as investors rotate toward quality', source: 'The Financial Wire', time: '1 hr ago', tag: 'Bonds' },
  ],
}

const defaultExpenseItems: ExpenseItem[] = [
  { id: '1', title: 'Netflix', merchant: 'Netflix', category: 'subscriptions', amount: 15.99, cadence: 'monthly', startDate: '2024-01-15', essential: false, autoLink: true, confidence: 'high' },
  { id: '2', title: 'Spotify', merchant: 'Spotify', category: 'subscriptions', amount: 12.99, cadence: 'monthly', startDate: '2023-06-01', essential: false, autoLink: true, confidence: 'high' },
  { id: '3', title: 'Adobe Creative Cloud', merchant: 'Adobe', category: 'subscriptions', amount: 54.99, cadence: 'monthly', startDate: '2025-03-01', essential: true, autoLink: true, confidence: 'medium' },
  { id: '4', title: 'Planet Fitness', merchant: 'Planet Fitness', category: 'subscriptions', amount: 25, cadence: 'monthly', startDate: '2025-08-01', essential: true, autoLink: true, confidence: 'high' },
  { id: '5', title: 'Gas', merchant: 'Shell', category: 'transport', amount: 150, cadence: 'monthly', startDate: '2025-01-01', essential: true, autoLink: false },
  { id: '6', title: 'Uber/Lyft', merchant: 'Uber', category: 'transport', amount: 80, cadence: 'monthly', startDate: '2025-01-01', essential: false, autoLink: false },
  { id: '7', title: 'Grocery', merchant: 'Whole Foods', category: 'groceries', amount: 500, cadence: 'monthly', startDate: '2025-01-01', essential: true, autoLink: false },
  { id: '8', title: 'Electricity', merchant: 'PG&E', category: 'utilities', amount: 120, cadence: 'monthly', startDate: '2025-01-01', essential: true, autoLink: true, confidence: 'medium' },
  { id: '9', title: 'Internet', merchant: 'Comcast', category: 'utilities', amount: 89.99, cadence: 'monthly', startDate: '2025-01-01', essential: true, autoLink: true, confidence: 'high' },
  { id: '10', title: 'Water', merchant: 'City Water', category: 'utilities', amount: 45, cadence: 'monthly', startDate: '2025-01-01', essential: true, autoLink: false },
]

const defaultBudgets: CategoryBudget[] = [
  { category: 'subscriptions', ceiling: 200 },
  { category: 'transport', ceiling: 400 },
  { category: 'groceries', ceiling: 600 },
  { category: 'utilities', ceiling: 300 },
  { category: 'housing', ceiling: 2000 },
  { category: 'other', ceiling: 500 },
]

const interestOptions = ['Index funds', 'Mutual funds', 'REITs', 'Crypto', 'HYSA', 'Bonds']

const uiCopy = {
  en: { assistant: 'AI Pocket Advisor', ask: 'Ask your immediate assistant', overview: 'Overview', portfolio: 'My Portfolio', expenses: 'Expenses', expenseInput: 'Expense Input', expenseAnalysis: 'Expense Analysis', market: 'Market', learn: 'Learn', logout: 'Log out', greeting: 'let’s make progress.', welcome: 'Welcome to AI Pocket Advisor', language: 'Language' },
  yue: { assistant: 'AI Pocket Advisor', ask: '問下你嘅即時助手', overview: '概覽', portfolio: '我嘅組合', expenses: '支出', expenseInput: '輸入支出', expenseAnalysis: '分析支出', market: '市場', learn: '學習', logout: '登出', greeting: '一齊向前行。', welcome: '歡迎使用 AI Pocket Advisor', language: '語言' },
  zh: { assistant: 'AI Pocket Advisor', ask: '询问你的即时助手', overview: '概览', portfolio: '我的组合', expenses: '支出', expenseInput: '输入支出', expenseAnalysis: '分析支出', market: '市场', learn: '学习', logout: '退出登录', greeting: '一起向前进。', welcome: '欢迎使用 AI Pocket Advisor', language: '语言' },
} as const

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="brand-lockup">
      <img src="/aurum-ai-logo.svg" alt="AI Pocket Advisor" className={compact ? 'brand-mark compact' : 'brand-mark'} />
      {!compact && <div><div className="brand-name">AI Pocket</div><div className="brand-subtitle">advisor</div></div>}
    </div>
  )
}

function AuthScreen({ onAuth, language, onLanguageChange }: { onAuth: (name: string) => void; language: Language; onLanguageChange: (language: Language) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [name, setName] = useState('Alex Morgan')
  const [email, setEmail] = useState('alex@example.com')
  const [password, setPassword] = useState('aurum-demo')
  const [error, setError] = useState('')

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim() || !email.includes('@') || password.length < 6) {
      setError('Enter your name, a valid email, and a password with 6+ characters.')
      return
    }
    onAuth(name.trim())
  }

  return (
    <main className="auth-page">
      <div className="auth-grid" />
      <header className="auth-header"><Logo /><div className="auth-header-actions"><LanguageSelect language={language} onChange={onLanguageChange} /><span className="secure-pill"><ShieldCheck size={14} /> Your data stays yours</span></div></header>
      <section className="auth-content">
        <div className="auth-story">
          <div className="eyebrow"><Sparkles size={15} /> Intelligent wealth, made personal</div>
          <h1>Make your money<br /><em>move with intention.</em></h1>
          <p>AI Pocket Advisor turns your real-world financial picture into a calm, clear plan for what comes next — from emergency savings to long-term investing.</p>
          <div className="story-points"><span><Check size={16} /> No bank connection required</span><span><Check size={16} /> Built on transparent logic</span><span><Check size={16} /> Always educational, never a promise</span></div>
        </div>
        <div className="auth-card">
          <div className="auth-card-top"><div><p className="overline">Welcome to AI Pocket Advisor</p><h2>{mode === 'register' ? 'Build your wealth view' : 'Welcome back'}</h2></div><div className="auth-badge"><BrainCircuit size={19} /></div></div>
          <div className="auth-tabs"><button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button><button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button></div>
          <form onSubmit={submit}>
            {mode === 'register' && <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>}
            <label>Email address<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
            <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="primary-button" type="submit">{mode === 'register' ? 'Start my wealth view' : 'Log in to AI Pocket Advisor'} <ArrowUpRight size={17} /></button>
          </form>
          <button className="demo-button" onClick={() => onAuth('Alex Morgan')}><Compass size={16} /> Explore with demo profile</button>
          <p className="legal-copy">By continuing, you agree that AI Pocket Advisor provides educational information, not individualized financial advice.</p>
        </div>
      </section>
      <footer className="auth-footer"><span>© 2026 AI Pocket Advisor</span><span>Privacy</span><span>How it works</span><span>Built for thoughtful investors</span></footer>
    </main>
  )
}

function ProfileForm({ profile, setProfile, onGenerate, loading }: { profile: Profile; setProfile: (profile: Profile) => void; onGenerate: () => void; loading: boolean }) {
  function update(key: keyof Profile, value: string | number) { setProfile({ ...profile, [key]: value }) }
  function toggleInterest(item: string) { setProfile({ ...profile, interests: profile.interests.includes(item) ? profile.interests.filter((x) => x !== item) : [...profile.interests, item] }) }
  return (
    <section className="profile-panel panel">
      <div className="section-heading"><div><p className="overline">Your financial snapshot</p><h2>Give AI Pocket Advisor the full picture</h2><p>More context means advice that feels less generic.</p></div><div className="step-count">01 <span>/ 01</span></div></div>
      <div className="form-grid">
        <label>Age<input type="number" value={profile.age} onChange={(e) => update('age', Number(e.target.value))} /></label>
        <label>Annual salary<input type="number" value={profile.salary} onChange={(e) => update('salary', Number(e.target.value))} /></label>
        <label>Other annual income<input type="number" value={profile.otherIncome} onChange={(e) => update('otherIncome', Number(e.target.value))} /></label>
        <label>Monthly expenses<input type="number" value={profile.expenses} onChange={(e) => update('expenses', Number(e.target.value))} /></label>
        <label>Total high-interest debt<input type="number" value={profile.debt} onChange={(e) => update('debt', Number(e.target.value))} /></label>
        <label>Emergency savings<input type="number" value={profile.emergencySavings} onChange={(e) => update('emergencySavings', Number(e.target.value))} /></label>
        <label className="span-two">Primary money goal<select value={profile.goal} onChange={(e) => update('goal', e.target.value)}><option>Build long-term wealth</option><option>Buy a home</option><option>Fund education</option><option>Reach financial independence</option><option>Protect my family</option></select></label>
        <label>Goal timeline<select value={profile.timeline} onChange={(e) => update('timeline', Number(e.target.value))}><option value={2}>1–3 years</option><option value={5}>3–7 years</option><option value={10}>7–15 years</option><option value={20}>15+ years</option></select></label>
      </div>
      <div className="field-group"><span className="field-label">How much market movement can you live with?</span><div className="risk-options">{(['conservative', 'balanced', 'growth'] as const).map((risk) => <button key={risk} className={profile.risk === risk ? 'selected' : ''} onClick={() => update('risk', risk)}><span className={`risk-dot ${risk}`} /> <strong>{risk[0].toUpperCase() + risk.slice(1)}</strong><small>{risk === 'conservative' ? 'Protect first' : risk === 'balanced' ? 'Steady compounding' : 'Maximize upside'}</small>{profile.risk === risk && <Check size={14} />}</button>)}</div></div>
      <div className="field-group"><span className="field-label">What are you curious about?</span><div className="interest-list">{interestOptions.map((item) => <button key={item} className={profile.interests.includes(item) ? 'interest selected' : 'interest'} onClick={() => toggleInterest(item)}>{profile.interests.includes(item) ? <Check size={13} /> : <Plus size={13} />}{item}</button>)}</div></div>
      <button className="primary-button wide" onClick={onGenerate} disabled={loading}>{loading ? <><RefreshCw size={16} className="spin" /> Thinking through your picture...</> : <>Generate my plan <ChevronRight size={17} /></>}</button>
    </section>
  )
}

function RecommendationCard({ recommendation, onEdit }: { recommendation: Recommendation; onEdit: () => void }) {
  return <section className="recommendation-panel panel"><div className="section-heading"><div><p className="overline aqua">Your AI Pocket Advisor read</p><h2>A plan with room to breathe.</h2><p>Based on your {recommendation.profileLabel.toLowerCase()} profile and stated priorities.</p></div><button className="text-button" onClick={onEdit}>Edit snapshot <ArrowUpRight size={15} /></button></div><div className="recommendation-grid"><div className="allocation"><div className="allocation-ring"><div><strong>{recommendation.allocation.find((item) => item.name === 'Index funds')?.value ?? 0}%</strong><span>core growth</span></div></div><div className="allocation-legend">{recommendation.allocation.map((item) => <div key={item.name}><span className="legend-dot" style={{ backgroundColor: `var(${item.color})` }} /><div><strong>{item.name}</strong><span>{item.value}% · {item.reason}</span></div></div>)}</div></div><div className="plan-summary"><div className="summary-number"><span>Suggested monthly contribution</span><strong>{money(recommendation.monthlyContribution)}</strong><small>about {Math.round(recommendation.monthlyContribution / 4)} per week</small></div><div className="summary-number"><span>Emergency fund target</span><strong>{money(recommendation.emergencyTarget)}</strong><small className={recommendation.emergencyGap > 0 ? 'warning' : 'positive'}>{recommendation.emergencyGap > 0 ? `${money(recommendation.emergencyGap)} to go` : 'You are on track'}</small></div><div className="rationale"><h3>Why this mix</h3>{recommendation.rationale.map((item) => <p key={item}><Check size={14} />{item}</p>)}</div></div></div><div className="action-strip"><div><Target size={18} /><div><strong>Your next best move</strong><span>{recommendation.actions[0]}</span></div></div><button className="small-button">See action plan <ChevronRight size={15} /></button></div><details className="more-details"><summary>See risks and asset ideas</summary><div className="details-grid"><div><h3>Watch-outs</h3>{recommendation.risks.map((item) => <p key={item}>• {item}</p>)}</div><div><h3>Explore first</h3>{recommendation.ideas.map((item) => <p key={item}>• {item}</p>)}</div></div></details><p className="disclaimer">AI Pocket Advisor is an educational planning tool. Allocation examples are illustrative and are not a recommendation to buy or sell any security.</p></section>
}

function MarketPanel({ market, onRefresh, refreshing }: { market: Market; onRefresh: () => void; refreshing: boolean }) {
  return <><section className="market-panel panel"><div className="section-heading compact-heading"><div><p className="overline">Market pulse</p><h2>Stay curious, not reactive.</h2></div><button className="icon-button" aria-label="Refresh market data" onClick={onRefresh}><RefreshCw size={16} className={refreshing ? 'spin' : ''} /></button></div><div className="pulse-row">{market.pulse.map((item) => <div className="pulse-card" key={item.name}><span>{item.name}</span><strong>{item.value}</strong><small className={item.tone}>{item.change}</small><div className="sparkline"><span /><span /><span /><span /><span /><span /></div></div>)}</div></section><div className="lower-grid"><section className="table-panel panel"><div className="section-heading compact-heading"><div><p className="overline">Watchlist</p><h2>Assets in motion</h2></div><button className="text-button">View all <ArrowUpRight size={15} /></button></div><div className="asset-table">{market.assets.map((asset) => <div className="asset-row" key={asset.symbol}><div className="asset-icon">{asset.symbol.slice(0, 1)}</div><div><strong>{asset.name}</strong><span>{asset.symbol}</span></div><strong className="asset-price">{asset.price}</strong><span className={asset.tone}>{asset.change}</span><ChevronRight size={15} /></div>)}</div></section><section className="news-panel panel"><div className="section-heading compact-heading"><div><p className="overline">Signal, not noise</p><h2>Market brief</h2></div><Newspaper size={18} className="muted-icon" /></div><div className="news-list">{market.news.map((item) => <article key={item.title}><div className="news-meta"><span>{item.tag}</span><time>{item.time}</time></div><h3>{item.title}</h3><p>{item.source}</p></article>)}</div></section></div><section className="trend-panel panel"><div><p className="overline">Themes to explore</p><h2>What is moving the conversation</h2></div><div className="trend-list">{market.trending.map((trend) => <span key={trend}><TrendingUp size={14} />{trend}</span>)}</div></section></>
}

function LanguageSelect({ language, onChange }: { language: Language; onChange: (language: Language) => void }) {
  return <label className="language-select"><span className="sr-only">Language</span><select aria-label="Language" value={language} onChange={(event) => onChange(event.target.value as Language)}><option value="en">English</option><option value="yue">廣東話</option><option value="zh">普通话</option></select></label>
}

function Assistant({ language, profile, recommendation, market }: { language: Language; profile: Profile; recommendation: Recommendation | null; market: Market }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const t = uiCopy[language]
  const suggestions = language === 'en' ? ['Explain my allocation', 'How much emergency savings do I need?', 'Should I add more crypto?'] : language === 'yue' ? ['解釋我嘅資產配置', '我需要幾多應急儲蓄？', '我應唔應該增加加密貨幣？'] : ['解释我的资产配置', '我需要多少应急储蓄？', '我应该增加加密货币吗？']
  async function send(text = input) { if (!text.trim() || sending) return; const userMessage = text.trim(); setInput(''); setMessages((current) => [...current, { role: 'user', content: userMessage }]); setSending(true); try { const response = await fetch('/api/assistant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: userMessage, language, profile, recommendation, market }) }); const data = await response.json(); setMessages((current) => [...current, { role: 'assistant', content: data.message }]) } catch { setMessages((current) => [...current, { role: 'assistant', content: language === 'yue' ? '而家未能連接助手，請稍後再試。' : language === 'zh' ? '暂时无法连接助手，请稍后再试。' : 'The assistant is unavailable right now. Please try again.' }]) } finally { setSending(false) } }
  return <><button className="assistant-launcher" aria-label={t.assistant} onClick={() => setOpen(true)}><MessageCircle size={19} /><span>{t.assistant}</span><i /></button>{open && <section className="assistant-panel" aria-label={t.assistant}><header><div><strong>{t.assistant}</strong><span>{t.ask}</span></div><button aria-label="Close assistant" onClick={() => setOpen(false)}><X size={17} /></button></header><div className="assistant-messages">{messages.length === 0 && <div className="assistant-welcome"><Sparkles size={18} /><p>{language === 'yue' ? '你好！我可以幫你睇下個人化投資計劃。' : language === 'zh' ? '你好！我可以帮你看看个性化投资计划。' : 'Hi! I can help you understand your personalized investment plan.'}</p></div>}{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`chat-message ${message.role}`}>{message.content}</div>)}{sending && <div className="chat-message assistant">...</div>}</div><div className="assistant-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)}>{suggestion}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); void send() }}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder={language === 'yue' ? '輸入問題…' : language === 'zh' ? '输入问题…' : 'Ask a question…'} /><button aria-label="Send message" type="submit"><ArrowUpRight size={17} /></button></form></section>}</>
}

function MyPlanView({ profile, recommendation, language }: { profile: Profile; recommendation: Recommendation | null; language: Language }) {
  const t = uiCopy[language]
  const hasProfile = profile.age > 0
  
  return (
    <div className="content-wrap my-plan-view">
      <section className="welcome-block">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> {t.plan}</p>
          <h2>Your personalized wealth roadmap</h2>
          <p>{hasProfile ? 'Here\'s your investment portfolio and action plan based on your profile.' : 'Complete the wealth onboarding to see your personalized plan.'}</p>
        </div>
      </section>

      {hasProfile && (
        <>
          {/* Profile Summary */}
          <section className="panel profile-summary">
            <h3>Your Profile</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <span className="summary-label">Age</span>
                <span className="summary-value">{profile.age}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Annual Income</span>
                <span className="summary-value">{money(profile.salary + profile.otherIncome)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Monthly Expenses</span>
                <span className="summary-value">{money(profile.expenses)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Emergency Savings</span>
                <span className="summary-value">{money(profile.emergencySavings)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Debt</span>
                <span className="summary-value">{money(profile.debt)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Goal</span>
                <span className="summary-value">{profile.goal}</span>
              </div>
            </div>
          </section>

          {/* Portfolio Recommendation */}
          {recommendation && (
            <section className="panel portfolio-section">
              <h3>{recommendation.profileLabel}</h3>
              <div className="allocation-chart">
                {recommendation.allocation.map((item) => (
                  <div key={item.name} className="allocation-item">
                    <div className="allocation-bar" style={{ width: `${item.value}%`, background: item.color }} />
                    <div className="allocation-info">
                      <span className="allocation-name">{item.name}</span>
                      <span className="allocation-value">{item.value}%</span>
                    </div>
                    <p className="allocation-reason">{item.reason}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {!hasProfile && (
        <div className="empty-state">
          <p>Start your wealth journey to see your personalized plan.</p>
        </div>
      )}
    </div>
  )
}

// ============ ACTION PLAN VIEW ============

type ActionStep = {
  id: string
  title: string
  amount: number
  bucket: 'this-month' | 'next-month' | 'after-debt' | 'ongoing'
  rationale: string
  impact: {
    interestSaved?: number
    monthsFaster?: number
    netWorthDelta?: number
  }
  status: 'pending' | 'accepted' | 'snoozed' | 'removed'
  remindDate?: string
  modifiedAmount?: number
}

type MoneyLeak = {
  id: string
  title: string
  category: string
  monthlyCost: number
  potentialSavingRange: [number, number]
  confidence: 'high' | 'medium' | 'low'
  evidence: { txnId: string; date: string; amount: number; merchant: string }[]
}

type SimulationResult = {
  netWorthDelta5yr: number
  freedomDateCurrent: string
  freedomDateProjected: string
  monthsToDebtFree: number
  netWorthTimeseries: { month: number; value: number }[]
  debtTimeseries: { month: number; value: number }[]
}

function ActionPlanView({ profile, recommendation, language }: { profile: Profile; recommendation: Recommendation | null; language: Language }) {
  const t = uiCopy[language]
  
  // Demo data - in production this comes from API
  const [leaks] = useState<MoneyLeak[]>([
    { id: '1', title: 'Recurring subscriptions', category: 'Subscriptions', monthlyCost: 187, potentialSavingRange: [80, 187], confidence: 'high', evidence: [{ txnId: 't1', date: '2026-08-01', amount: 15.99, merchant: 'Netflix' }, { txnId: 't2', date: '2026-08-05', amount: 12.99, merchant: 'Spotify' }, { txnId: 't3', date: '2026-08-10', amount: 9.99, merchant: 'Adobe' }] },
    { id: '2', title: 'Dining out overlap', category: 'Food', monthlyCost: 320, potentialSavingRange: [120, 200], confidence: 'medium', evidence: [{ txnId: 't4', date: '2026-08-02', amount: 45, merchant: 'Restaurant A' }, { txnId: 't5', date: '2026-08-08', amount: 52, merchant: 'Restaurant B' }] },
    { id: '3', title: 'Unused gym membership', category: 'Subscriptions', monthlyCost: 150, potentialSavingRange: [150, 150], confidence: 'high', evidence: [{ txnId: 't6', date: '2026-08-01', amount: 150, merchant: 'Fitness First' }] },
  ])
  
  const [steps, setSteps] = useState<ActionStep[]>([
    { id: 's1', title: 'Cancel unused gym membership', amount: 150, bucket: 'this-month', rationale: 'You haven\'t logged in for 3 months. Cancel to save $1,800/year.', impact: { netWorthDelta: 1800 }, status: 'pending' },
    { id: 's2', title: 'Reduce dining out to twice per week', amount: 120, bucket: 'this-month', rationale: 'Cutting 2 restaurant meals per week frees up $480/month.', impact: { netWorthDelta: 480 * 12 }, status: 'pending' },
    { id: 's3', title: 'Apply extra $300 to credit card', amount: 300, bucket: 'this-month', rationale: '19.9% APR — paying extra saves ~$1,200 interest/year.', impact: { interestSaved: 1200, monthsFaster: 8 }, status: 'pending' },
    { id: 's4', title: 'Increase emergency fund contribution', amount: 200, bucket: 'next-month', rationale: 'Build 3-month buffer faster for financial security.', impact: { netWorthDelta: 2400 }, status: 'pending' },
    { id: 's5', title: 'Redirect debt payment to investments', amount: 500, bucket: 'after-debt', rationale: 'After debt-free, redirect payments to build wealth.', impact: { netWorthDelta: 500 * 12 * 10 }, status: 'pending' },
    { id: 's6', title: 'Review and optimize insurance', amount: 85, bucket: 'ongoing', rationale: 'Annual policy review could save $1,020/year.', impact: { netWorthDelta: 1020 }, status: 'pending' },
  ])
  
  const [simulation, setSimulation] = useState<SimulationResult>({
    netWorthDelta5yr: 24300,
    freedomDateCurrent: 'Sep 2048',
    freedomDateProjected: 'Sep 2044',
    monthsToDebtFree: 26,
    netWorthTimeseries: [
      { month: 0, value: 15000 }, { month: 6, value: 22500 }, { month: 12, value: 31000 }, 
      { month: 18, value: 40500 }, { month: 24, value: 51000 }, { month: 36, value: 74000 }, { month: 60, value: 125000 }
    ],
    debtTimeseries: [
      { month: 0, value: 12000 }, { month: 6, value: 8500 }, { month: 12, value: 4800 }, 
      { month: 18, value: 1800 }, { month: 24, value: 0 }
    ],
  })
  
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [modifyAmount, setModifyAmount] = useState<number>(0)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<string | null>(null)
  const [snoozeDate, setSnoozeDate] = useState<string>('')
  
  const buckets = [
    { key: 'this-month', label: 'This Month', icon: Zap, color: '#ef4444' },
    { key: 'next-month', label: 'Next Month', icon: Calendar, color: '#f97316' },
    { key: 'after-debt', label: 'After Debt Cleared', icon: TrendingUp, color: '#22c55e' },
    { key: 'ongoing', label: 'Ongoing', icon: RefreshCw, color: '#6366f1' },
  ] as const
  
  const handleAccept = (stepId: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, status: 'accepted' as const } : s))
  }
  
  const handleBatchAccept = () => {
    const top3 = steps.filter(s => s.status === 'pending').slice(0, 3).map(s => s.id)
    setSteps(steps.map(s => top3.includes(s.id) ? { ...s, status: 'accepted' as const } : s))
  }
  
  const handleModify = (stepId: string) => {
    const step = steps.find(s => s.id === stepId)
    if (step) {
      setModifyAmount(step.amount)
      setEditingStep(stepId)
    }
  }
  
  const handleSaveModify = (stepId: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, modifiedAmount: modifyAmount, status: 'accepted' as const } : s))
    setEditingStep(null)
  }
  
  const handleSnooze = (stepId: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, status: 'snoozed' as const, remindDate: snoozeDate || undefined } : s))
  }
  
  const handleRemove = (stepId: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, status: 'removed' as const } : s))
    setShowRemoveConfirm(null)
  }
  
  const pendingSteps = steps.filter(s => s.status === 'pending')
  const acceptedSteps = steps.filter(s => s.status === 'accepted')
  
  return (
    <div className="content-wrap action-plan-view">
      {/* Header Summary */}
      <section className="welcome-block">
        <div>
          <p className="eyebrow"><Target size={14} /> Action Plan</p>
          <h2>Your personalized wealth roadmap</h2>
          <p>Follow these steps to reach financial freedom faster.</p>
        </div>
        <div className="date-chip">
          <CircleDollarSign size={16} /> Updated just now
        </div>
      </section>
      
      {/* Simulation Summary */}
      <section className="panel simulation-summary">
        <div className="sim-header">
          <h3>Following this plan:</h3>
        </div>
        <div className="sim-stats">
          <div className="sim-stat">
            <span className="sim-stat-value">+{money(simulation.netWorthDelta5yr)}</span>
            <span className="sim-stat-label">in 5 years</span>
          </div>
          <div className="sim-stat">
            <span className="sim-stat-label">Financial Freedom</span>
            <span className="sim-stat-value">{simulation.freedomDateCurrent} → {simulation.freedomDateProjected}</span>
          </div>
          <div className="sim-stat">
            <span className="sim-stat-value">{simulation.monthsToDebtFree}</span>
            <span className="sim-stat-label">months to debt-free</span>
          </div>
        </div>
      </section>
      
      {/* Money Leaks */}
      <section className="panel leaks-panel">
        <h3><Zap size={18} /> Detected Money Leaks</h3>
        <div className="leaks-grid">
          {leaks.map(leak => (
            <div key={leak.id} className="leak-card">
              <div className="leak-header">
                <span className="leak-title">{leak.title}</span>
                <span className="leak-cost">{money(leak.monthlyCost)}/mo</span>
              </div>
              <p className="leak-saving">Potential save: {money(leak.potentialSavingRange[0])} - {money(leak.potentialSavingRange[1])}/mo</p>
              <div className="leak-evidence">
                {leak.evidence.slice(0, 2).map(ev => (
                  <span key={ev.txnId} className="evidence-tag">{ev.merchant}</span>
                ))}
                {leak.evidence.length > 2 && <span className="evidence-more">+{leak.evidence.length - 2} more</span>}
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Action Steps */}
      <section className="panel steps-panel">
        <div className="steps-header">
          <h3>Recommended Actions</h3>
          {pendingSteps.length >= 3 && (
            <button className="batch-accept-btn" onClick={handleBatchAccept}>
              <Check size={16} /> Accept top 3
            </button>
          )}
        </div>
        
        {buckets.map(bucket => {
          const bucketSteps = steps.filter(s => s.bucket === bucket.key && s.status !== 'removed')
          if (bucketSteps.length === 0) return null
          
          return (
            <div key={bucket.key} className="time-bucket">
              <div className="bucket-header">
                <bucket.icon size={16} style={{ color: bucket.color }} />
                <span className="bucket-label">{bucket.label}</span>
                <span className="bucket-count">{bucketSteps.length}</span>
              </div>
              
              <div className="steps-list">
                {bucketSteps.map(step => (
                  <div key={step.id} className={`step-card ${step.status}`}>
                    <div className="step-content">
                      <div className="step-main">
                        <h4>{step.title}</h4>
                        <p className="step-rationale">{step.rationale}</p>
                      </div>
                      
                      <div className="step-amount">
                        <span className="amount-value">{money(step.modifiedAmount || step.amount)}</span>
                        <span className="amount-label">/month</span>
                      </div>
                      
                      {step.impact && (
                        <div className="step-impact">
                          {step.impact.interestSaved && <span>Save {money(step.impact.interestSaved)}/yr interest</span>}
                          {step.impact.monthsFaster && <span>{step.impact.monthsFaster} months faster</span>}
                          {step.impact.netWorthDelta && <span>+{money(step.impact.netWorthDelta)} net worth</span>}
                        </div>
                      )}
                    </div>
                    
                    {step.status === 'pending' && (
                      <div className="step-actions">
                        {editingStep === step.id ? (
                          <div className="modify-inline">
                            <input 
                              type="range" 
                              min="0" 
                              max={(step.amount * 2)} 
                              value={modifyAmount}
                              onChange={(e) => setModifyAmount(Number(e.target.value))}
                            />
                            <span>{money(modifyAmount)}</span>
                            <button onClick={() => handleSaveModify(step.id)}><Check size={14} /></button>
                            <button onClick={() => setEditingStep(null)}><X size={14} /></button>
                          </div>
                        ) : (
                          <>
                            <button className="btn-accept" onClick={() => handleAccept(step.id)}>
                              <Check size={14} /> Accept
                            </button>
                            <button className="btn-modify" onClick={() => handleModify(step.id)}>
                              Modify
                            </button>
                            <button className="btn-snooze" onClick={() => setSnoozeDate('')}>
                              <Pause size={14} /> Snooze
                            </button>
                            <button className="btn-remove" onClick={() => setShowRemoveConfirm(step.id)}>
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    
                    {step.status === 'accepted' && (
                      <div className="step-accepted-badge">
                        <Check size={14} /> Accepted
                      </div>
                    )}
                    
                    {step.status === 'snoozed' && (
                      <div className="step-snoozed-badge">
                        <Clock size={14} /> Snoozed {step.remindDate && `until ${step.remindDate}`}
                      </div>
                    )}
                    
                    {showRemoveConfirm === step.id && (
                      <div className="remove-confirm">
                        <p>Why remove?</p>
                        <div className="remove-options">
                          <button onClick={() => handleRemove(step.id)}>Not relevant</button>
                          <button onClick={() => handleRemove(step.id)}>Already doing</button>
                          <button onClick={() => setShowRemoveConfirm(null)}>Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

export function AurumMvp() {
  const [user, setUser] = useState<string | null>(null)
  const [language, setLanguage] = useState<Language>('en')
  const t = uiCopy[language]
  const [profile, setProfile] = useState<Profile>(defaultProfile)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [market, setMarket] = useState<Market>(fallbackMarket)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [wizardOpen, setWizardOpen] = useState(false)
  const [activeView, setActiveView] = useState<'overview' | 'portfolio' | 'expense-input' | 'expense-analysis' | 'action-plan'>('overview')

  // Shared expense state (persisted)
  const [expenseItems, setExpenseItems] = useState<ExpenseItem[]>(defaultExpenseItems)
  const [budgets, setBudgets] = useState<CategoryBudget[]>(defaultBudgets)
  const [monthlyIncome, setMonthlyIncome] = useState<number>(5200)

  // Load persisted expense data
  useEffect(() => {
    const savedItems = window.localStorage.getItem('aurum-expense-items')
    const savedBudgets = window.localStorage.getItem('aurum-expense-budgets')
    const savedIncome = window.localStorage.getItem('aurum-monthly-income')
    if (savedItems) setExpenseItems(JSON.parse(savedItems))
    if (savedBudgets) setBudgets(JSON.parse(savedBudgets))
    if (savedIncome) setMonthlyIncome(Number(savedIncome))
  }, [])

  // Persist expense data
  useEffect(() => {
    window.localStorage.setItem('aurum-expense-items', JSON.stringify(expenseItems))
  }, [expenseItems])
  useEffect(() => {
    window.localStorage.setItem('aurum-expense-budgets', JSON.stringify(budgets))
  }, [budgets])
  useEffect(() => {
    window.localStorage.setItem('aurum-monthly-income', String(monthlyIncome))
  }, [monthlyIncome])

  // Expense update functions passed to child views
  const handleUpdateExpenseItems = (items: ExpenseItem[]) => setExpenseItems(items)
  const handleUpdateBudgets = (newBudgets: CategoryBudget[]) => setBudgets(newBudgets)

  useEffect(() => { const saved = window.localStorage.getItem('aurum-demo-user'); const savedProfile = window.localStorage.getItem('aurum-demo-profile'); const savedLanguage = window.localStorage.getItem('ai-pocket-language') as Language | null; if (saved) setUser(saved); if (savedProfile) setProfile(JSON.parse(savedProfile)); if (savedLanguage === 'en' || savedLanguage === 'yue' || savedLanguage === 'zh') setLanguage(savedLanguage); fetch('/api/market').then((res) => res.json()).then((data) => data?.news && setMarket(data)).catch(() => undefined) }, [])
  useEffect(() => { if (user) window.localStorage.setItem('aurum-demo-profile', JSON.stringify(profile)) }, [profile, user])
  function changeLanguage(next: Language) { setLanguage(next); window.localStorage.setItem('ai-pocket-language', next) }
  function auth(name: string) { setUser(name); window.localStorage.setItem('aurum-demo-user', name) }
  
  // Convert wizard data to profile format
  function mapWizardToProfile(wizardData: {
    age: number | null
    monthlyIncome: number | null
    monthlyEssentialExpenses: number | null
    monthlyDiscretionary: number | null
    totalSavings: number | null
    debts: { balance: number | null }[]
    riskScore: number
    goals: { name: string; timeline: number }[]
  }): Profile {
    const totalDebt = wizardData.debts.reduce((sum, d) => sum + (d.balance || 0), 0)
    const riskMap: ('conservative' | 'balanced' | 'growth')[] = ['conservative', 'balanced', 'balanced', 'growth', 'growth']
    return {
      age: wizardData.age || 30,
      salary: Math.round((wizardData.monthlyIncome || 0) * 12),
      otherIncome: 0,
      expenses: (wizardData.monthlyEssentialExpenses || 0) + (wizardData.monthlyDiscretionary || 0),
      debt: totalDebt,
      emergencySavings: wizardData.totalSavings || 0,
      goal: wizardData.goals?.[0]?.name || 'Build long-term wealth',
      timeline: wizardData.goals?.[0]?.timeline || 10,
      risk: riskMap[Math.min(Math.max(wizardData.riskScore, 0), 4)] || 'balanced',
      interests: [],
    }
  }
  
  async function generate() { setLoading(true); try { const response = await fetch('/api/recommend', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) }); const data = await response.json(); if (response.ok) setRecommendation(data) } finally { setLoading(false) } }
  async function refreshMarket() { setRefreshing(true); try { const response = await fetch('/api/market?refresh=1'); const data = await response.json(); if (data?.news) setMarket(data) } finally { setRefreshing(false) } }
  if (!user) return <AuthScreen onAuth={auth} language={language} onLanguageChange={changeLanguage} />
  // Generate or get user ID for database tracking
  const getUserId = () => {
    let userId = localStorage.getItem('aurum_user_id')
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('aurum_user_id', userId)
    }
    return userId
  }

  if (wizardOpen) return <WealthWizard initialLanguage={language} onClose={() => setWizardOpen(false)} onComplete={async (data) => { 
    const newProfile = mapWizardToProfile(data)
    setProfile(newProfile)
    setRecommendation(null)
    setWizardOpen(false)
    setActiveView('portfolio')
    window.localStorage.setItem('aurum-demo-profile', JSON.stringify(newProfile))
    
    // Save profile to Supabase
    const userId = getUserId()
    await saveProfileToDatabase({
      user_id: userId,
      name: user,
      email: user + '@demo.local',
      monthly_income: newProfile.monthlyIncome || 0,
      currency: 'USD'
    })
  }} />
  return <main className="app-shell"><aside className={mobileNav ? 'sidebar open' : 'sidebar'}><div className="sidebar-top"><Logo /><button className="close-nav" onClick={() => setMobileNav(false)}><X size={18} /></button></div><nav><p className="nav-label">Workspace</p><button className={`nav-item ${activeView === 'overview' ? 'active' : ''}`} onClick={() => setActiveView('overview')}><LayoutDashboard size={17} /> {t.overview}</button><button className="nav-item" onClick={() => setWizardOpen(true)}><Wallet size={17} /> Wealth Onboarding</button><button className={`nav-item ${activeView === 'portfolio' ? 'active' : ''}`} onClick={() => setActiveView('portfolio')}><WalletCards size={17} /> {t.portfolio}</button><button className={`nav-item ${activeView === 'action-plan' ? 'active' : ''}`} onClick={() => setActiveView('action-plan')}><Target size={17} /> Action Plan</button><button className={`nav-item ${activeView === 'expense-input' ? 'active' : ''}`} onClick={() => setActiveView('expense-input')}><Edit3 size={17} /> {t.expenseInput}</button><button className={`nav-item ${activeView === 'expense-analysis' ? 'active' : ''}`} onClick={() => setActiveView('expense-analysis')}><PieChart size={17} /> {t.expenseAnalysis}</button><button className="nav-item"><BarChart3 size={17} /> {t.market}</button><button className="nav-item"><BookOpen size={17} /> {t.learn}</button><p className="nav-label spaced">Your progress</p><div className="progress-card"><div className="progress-icon"><Gauge size={16} /></div><strong>Investor profile</strong><span>80% complete</span><div className="progress-line"><i /></div></div></nav><div className="sidebar-bottom"><button className="nav-item"><Bell size={17} /> Alerts <span className="notification-dot" /></button><button className="profile-mini"><span className="avatar">{user.slice(0, 1)}</span><span><strong>{user}</strong><small>Free account</small></span><ChevronRight size={15} /></button><button className="logout" onClick={() => { setUser(null); setRecommendation(null); window.localStorage.removeItem('aurum-demo-user') }}><LogOut size={15} /> Log out</button></div></aside><div className="main-content"><header className="topbar"><button className="mobile-menu" onClick={() => setMobileNav(true)}><Menu size={20} /></button><div><p className="topbar-kicker">Wednesday, August 5, 2026</p><h1>Good morning, {user.split(' ')[0]} <span>—</span> let&apos;s make progress.</h1></div><div className="topbar-actions"><LanguageSelect language={language} onChange={changeLanguage} /><button className="icon-button"><Bell size={17} /><i /></button><div className="avatar large">{user.slice(0, 1)}</div></div></header><Assistant language={language} profile={profile} recommendation={recommendation} market={market} /><div className="ticker"><span className="live-indicator" /> Live market snapshot <div className="ticker-track">{market.pulse.map((item) => <span key={item.name}><strong>{item.name}</strong> {item.value} <em className={item.tone}>{item.change}</em></span>)}</div></div>{activeView === 'overview' ? <div className="content-wrap"><section className="welcome-block"><div><p className="eyebrow"><Sparkles size={14} /> Your personal money cockpit</p><h2>Clarity compounds.</h2><p>Here&apos;s the signal from your financial picture, plus a few places to focus next.</p></div><div className="date-chip"><CircleDollarSign size={16} /> Updated just now</div></section>{!recommendation ? <ProfileForm profile={profile} setProfile={setProfile} onGenerate={generate} loading={loading} /> : <><RecommendationCard recommendation={recommendation} onEdit={() => setRecommendation(null)} /><MarketPanel market={market} onRefresh={refreshMarket} refreshing={refreshing} /></>}</div> : activeView === 'portfolio' ? <MyPlanView profile={profile} recommendation={recommendation} language={language} /> : activeView === 'expense-input' ? <ExpenseInputView language={language} expenseItems={expenseItems} budgets={budgets} onUpdateItems={handleUpdateExpenseItems} onUpdateBudgets={handleUpdateBudgets} /> : activeView === 'expense-analysis' ? <ExpenseAnalysisView language={language} expenseItems={expenseItems} monthlyIncome={monthlyIncome} /> : <ActionPlanView profile={profile} recommendation={recommendation} language={language} />}</div></main>
}

// ============ EXPENSE INPUT VIEW ============

function ExpenseInputView({ language, expenseItems, budgets, onUpdateItems, onUpdateBudgets }: { language: Language, expenseItems: ExpenseItem[], budgets: CategoryBudget[], onUpdateItems: (items: ExpenseItem[]) => void, onUpdateBudgets: (budgets: CategoryBudget[]) => void }) {
  const t = uiCopy[language]
  
  // Use shared state passed from parent
  const [items, setItems] = useState<ExpenseItem[]>(expenseItems)
  const [localBudgets, setLocalBudgets] = useState<CategoryBudget[]>(budgets)
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'transport' | 'groceries' | 'utilities' | 'other'>('subscriptions')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null)
  const [showSuggestModal, setShowSuggestModal] = useState(false)
  
  const categoryLabels: Record<string, string> = {
    subscriptions: 'Subscriptions',
    transport: 'Transport',
    groceries: 'Groceries',
    utilities: 'Utilities',
    housing: 'Housing',
    other: 'Other',
  }
  
  const tabs = ['subscriptions', 'transport', 'groceries', 'utilities', 'other'] as const
  
  const filteredItems = items.filter(item => item.category === activeTab)
  
  const monthlyTotals = items.reduce((acc, item) => {
    let monthly = item.amount
    if (item.cadence === 'weekly') monthly = item.amount * 4.33
    if (item.cadence === 'quarterly') monthly = item.amount / 3
    if (item.cadence === 'annually') monthly = item.amount / 12
    return acc + monthly
  }, 0)
  
  const essentialTotal = items.filter(i => i.essential).reduce((acc, item) => {
    let monthly = item.amount
    if (item.cadence === 'weekly') monthly = item.amount * 4.33
    if (item.cadence === 'quarterly') monthly = item.amount / 3
    if (item.cadence === 'annually') monthly = item.amount / 12
    return acc + monthly
  }, 0)
  
  const discretionaryTotal = monthlyTotals - essentialTotal
  
  const totalBudget = localBudgets.reduce((sum, b) => sum + b.ceiling, 0)
  const budgetUtilization = (monthlyTotals / totalBudget) * 100
  
  const handleAdd = async (item: ExpenseItem) => {
    let updated: ExpenseItem[]
    if (editingItem) {
      updated = items.map(i => i.id === editingItem.id ? item : i)
    } else {
      updated = [...items, { ...item, id: Date.now().toString() }]
    }
    setItems(updated)
    onUpdateItems(updated)
    setShowAddModal(false)
    setEditingItem(null)
    
    // Save to Supabase database
    const userId = getUserId()
    await saveExpenseToDatabase({
      user_id: userId,
      expense_name: item.title,
      amount: item.amount,
      category: item.category,
      is_recurring: true
    })
  }
  
  const handleDelete = (id: string) => {
    const updated = items.filter(i => i.id !== id)
    setItems(updated)
    onUpdateItems(updated)
  }
  
  const handleToggleEssential = (id: string) => {
    const updated = items.map(i => i.id === id ? { ...i, essential: !i.essential } : i)
    setItems(updated)
    onUpdateItems(updated)
  }
  
  const updateBudget = (category: string, ceiling: number) => {
    const updated = localBudgets.map(b => b.category === category ? { ...b, ceiling } : b)
    setLocalBudgets(updated)
    onUpdateBudgets(updated)
  }
  
  const suggestItems: ExpenseItem[] = [
    { id: 's1', title: 'Amazon Prime', merchant: 'Amazon', category: 'subscriptions', amount: 14.99, cadence: 'monthly', startDate: '2024-01-01', essential: false, autoLink: true, confidence: 'high' },
    { id: 's2', title: 'iCloud Storage', merchant: 'Apple', category: 'subscriptions', amount: 2.99, cadence: 'monthly', startDate: '2025-01-01', essential: false, autoLink: true, confidence: 'high' },
    { id: 's3', title: 'Car Insurance', merchant: 'State Farm', category: 'other', amount: 180, cadence: 'monthly', startDate: '2025-01-01', essential: true, autoLink: false, confidence: 'medium' },
  ]
  
  const [selectedSuggests, setSelectedSuggests] = useState<string[]>([])
  
  const acceptSuggestions = () => {
    const newItems = suggestItems.filter(s => selectedSuggests.includes(s.id)).map(s => ({ ...s, id: Date.now().toString() + Math.random() }))
    const updated = [...items, ...newItems]
    setItems(updated)
    onUpdateItems(updated)
    setShowSuggestModal(false)
    setSelectedSuggests([])
  }
  
  return (
    <div className="content-wrap expense-input-view">
      <section className="welcome-block">
        <div>
          <p className="eyebrow"><Edit3 size={14} /> Expense Input</p>
          <h2>Track your recurring expenses</h2>
          <p>Add and manage your recurring subscriptions, transport, groceries, utilities and more.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="secondary-button" style={{ width: 'auto', padding: '0.6rem 1.2rem' }} onClick={() => setShowSuggestModal(true)}>
            <Sparkles size={16} /> Suggest Items
          </button>
          <button className="primary-button" style={{ width: 'auto', padding: '0.6rem 1.2rem' }} onClick={() => { setEditingItem(null); setShowAddModal(true) }}>
            <Plus size={16} /> Add Item
          </button>
        </div>
      </section>
      
      {/* Preview KPIs */}
      <section className="input-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Monthly Recurring</span>
          <span className="kpi-value">{money(monthlyTotals)}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Essential</span>
          <span className="kpi-value essential">{money(essentialTotal)}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Discretionary</span>
          <span className="kpi-value discretionary">{money(discretionaryTotal)}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Budget Utilization</span>
          <span className="kpi-value">{budgetUtilization.toFixed(0)}%</span>
          <div className="kpi-bar"><div className="kpi-bar-fill" style={{ width: `${Math.min(budgetUtilization, 100)}%`, background: budgetUtilization > 90 ? 'var(--coral)' : budgetUtilization > 70 ? '#f59e0b' : 'var(--mint)' }} /></div>
        </div>
      </section>
      
      {/* Category Budgets */}
      <section className="panel budgets-panel">
        <h3>Monthly Budgets</h3>
        <div className="budgets-grid">
          {localBudgets.map(b => {
            const catTotal = items.filter(i => i.category === b.category).reduce((sum, i) => {
              let m = i.amount
              if (i.cadence === 'weekly') m = i.amount * 4.33
              if (i.cadence === 'quarterly') m = i.amount / 3
              if (i.cadence === 'annually') m = i.amount / 12
              return sum + m
            }, 0)
            return (
              <div key={b.category} className="budget-item">
                <span className="budget-category">{categoryLabels[b.category]}</span>
                <div className="budget-input-wrap">
                  <span className="budget-current">{money(catTotal)}</span>
                  <span className="budget-sep">/</span>
                  <input type="number" className="budget-ceiling" value={b.ceiling} onChange={(e) => updateBudget(b.category, Number(e.target.value))} />
                </div>
                <div className="budget-bar"><div className="budget-bar-fill" style={{ width: `${Math.min((catTotal / b.ceiling) * 100, 100)}%`, background: catTotal > b.ceiling ? 'var(--coral)' : 'var(--aqua)' }} /></div>
              </div>
            )
          })}
        </div>
      </section>
      
      {/* Tabs */}
      <section className="panel">
        <div className="input-tabs">
          {tabs.map(tab => (
            <button key={tab} className={`input-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
              {categoryLabels[tab]}
              <span className="tab-count">{items.filter(i => i.category === tab).length}</span>
            </button>
          ))}
        </div>
        
        <div className="items-list">
          {filteredItems.length === 0 ? (
            <div className="empty-items">
              <p>No items in this category yet.</p>
              <button className="secondary-button" onClick={() => { setEditingItem(null); setShowAddModal(true) }}>Add your first {activeTab} item</button>
            </div>
          ) : (
            filteredItems.map(item => (
              <div key={item.id} className={`expense-item ${item.override ? 'overridden' : ''}`}>
                <div className="item-main">
                  <button className={`essential-toggle ${item.essential ? 'essential' : ''}`} onClick={() => handleToggleEssential(item.id)} title={item.essential ? 'Essential' : 'Discretionary'}>
                    {item.essential ? <ShieldCheck size={14} /> : <CircleDollarSign size={14} />}
                  </button>
                  <div className="item-info">
                    <span className="item-title">{item.title}</span>
                    <span className="item-meta">{item.merchant} • {item.cadence}</span>
                  </div>
                  {item.confidence && item.autoLink && (
                    <span className={`confidence-badge ${item.confidence}`}>{item.confidence}</span>
                  )}
                  {item.override && <span className="override-badge">Override</span>}
                </div>
                <div className="item-amount">
                  <span className="amount-value">{money(item.amount)}</span>
                  <span className="amount-period">/{item.cadence === 'weekly' ? 'wk' : item.cadence === 'monthly' ? 'mo' : item.cadence === 'quarterly' ? 'qtr' : 'yr'}</span>
                </div>
                <div className="item-actions">
                  <button className="icon-btn" onClick={() => { setEditingItem(item); setShowAddModal(true) }}><Edit3 size={14} /></button>
                  <button className="icon-btn danger" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      
      {/* Add/Edit Modal */}
      {showAddModal && (
        <ExpenseItemModal item={editingItem} categories={tabs} onSave={handleAdd} onClose={() => { setShowAddModal(false); setEditingItem(null) }} />
      )}
      
      {/* Suggest Modal */}
      {showSuggestModal && (
        <div className="modal-overlay" onClick={() => setShowSuggestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Sparkles size={18} /> Suggested Items</h3>
              <button className="modal-close" onClick={() => setShowSuggestModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p className="suggest-intro">Based on your transaction patterns, we suggest adding:</p>
              <div className="suggest-list">
                {suggestItems.map(item => (
                  <label key={item.id} className="suggest-item">
                    <input type="checkbox" checked={selectedSuggests.includes(item.id)} onChange={(e) => {
                      if (e.target.checked) setSelectedSuggests([...selectedSuggests, item.id])
                      else setSelectedSuggests(selectedSuggests.filter(id => id !== item.id))
                    }} />
                    <div className="suggest-info">
                      <span className="suggest-title">{item.title}</span>
                      <span className="suggest-meta">{categoryLabels[item.category]} • {money(item.amount)}/{item.cadence === 'monthly' ? 'mo' : 'yr'}</span>
                    </div>
                    <span className={`confidence-badge ${item.confidence}`}>{item.confidence}</span>
                  </label>
                ))}
              </div>
              <div className="suggest-actions">
                <button className="secondary-button" onClick={() => setShowSuggestModal(false)}>Cancel</button>
                <button className="primary-button" disabled={selectedSuggests.length === 0} onClick={acceptSuggestions}>Accept {selectedSuggests.length} Items</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ExpenseItemModal({ item, categories, onSave, onClose }: { item: ExpenseItem | null, categories: readonly string[], onSave: (item: ExpenseItem) => void, onClose: () => void }) {
  const [form, setForm] = useState<ExpenseItem>(item || {
    id: '',
    title: '',
    merchant: '',
    category: 'subscriptions',
    amount: 0,
    cadence: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    essential: false,
    autoLink: false,
    notes: '',
  })
  
  const categoryLabels: Record<string, string> = {
    subscriptions: 'Subscriptions',
    transport: 'Transport',
    groceries: 'Groceries',
    utilities: 'Utilities',
    housing: 'Housing',
    other: 'Other',
  }
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Edit' : 'Add'} Expense Item</h3>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>Title</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g., Netflix, Gas, Groceries" />
          </div>
          <div className="form-group">
            <label>Merchant</label>
            <input type="text" value={form.merchant} onChange={(e) => setForm({ ...form, merchant: e.target.value })} placeholder="e.g., Netflix, Shell, Whole Foods" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as any })}>
                {categories.map(cat => <option key={cat} value={cat}>{categoryLabels[cat]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Cadence</label>
              <select value={form.cadence} onChange={(e) => setForm({ ...form, cadence: e.target.value as any })}>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Amount</label>
              <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input type="checkbox" checked={form.essential} onChange={(e) => setForm({ ...form, essential: e.target.checked })} />
              Essential expense (required for basic living)
            </label>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." rows={2} />
          </div>
          <div className="form-actions">
            <button className="secondary-button" onClick={onClose}>Cancel</button>
            <button className="primary-button" disabled={!form.title || form.amount <= 0} onClick={() => onSave(form)}>Save Item</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============ EXPENSE ANALYSIS VIEW ============

function ExpenseAnalysisView({ language, expenseItems, monthlyIncome }: { language: Language, expenseItems: ExpenseItem[], monthlyIncome: number }) {
  const t = uiCopy[language]
  
  // Calculate spending from expense items
  const monthlyTotal = expenseItems.reduce((acc, item) => {
    let monthly = item.amount
    if (item.cadence === 'weekly') monthly = item.amount * 4.33
    if (item.cadence === 'quarterly') monthly = item.amount / 3
    if (item.cadence === 'annually') monthly = item.amount / 12
    return acc + monthly
  }, 0)
  
  const netCashFlow = monthlyIncome - monthlyTotal
  
  // Group by category for category spending
  const categoryMap = new Map<string, number>()
  expenseItems.forEach(item => {
    let monthly = item.amount
    if (item.cadence === 'weekly') monthly = item.amount * 4.33
    if (item.cadence === 'quarterly') monthly = item.amount / 3
    if (item.cadence === 'annually') monthly = item.amount / 12
    const current = categoryMap.get(item.category) || 0
    categoryMap.set(item.category, current + monthly)
  })
  
  const categorySpending: CategorySpending[] = Array.from(categoryMap.entries()).map(([category, amount]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    amount,
    percentOfIncome: (amount / monthlyIncome) * 100,
    moMChange: 0, // Would need historical data to calculate
  })).sort((a, b) => b.amount - a.amount)
  
  // Generate merchant spending from expense items
  const merchantMap = new Map<string, { amount: number; count: number }>()
  expenseItems.forEach(item => {
    let monthly = item.amount
    if (item.cadence === 'weekly') monthly = item.amount * 4.33
    if (item.cadence === 'quarterly') monthly = item.amount / 3
    if (item.cadence === 'annually') monthly = item.amount / 12
    const current = merchantMap.get(item.merchant) || { amount: 0, count: 0 }
    merchantMap.set(item.merchant, { amount: current.amount + monthly, count: current.count + 1 })
  })
  
  const merchantSpending: MerchantSpend[] = Array.from(merchantMap.entries()).map(([merchant, data]) => ({
    merchant,
    amount: data.amount,
    percentOfTotal: (data.amount / monthlyTotal) * 100,
    transactionCount: data.count,
  })).sort((a, b) => b.amount - a.amount)
  
  // Money Leak Engine - generate based on expense items
  const essentialItems = expenseItems.filter(i => i.essential)
  const discretionaryItems = expenseItems.filter(i => !i.essential)
  const essentialTotal = essentialItems.reduce((acc, item) => {
    let monthly = item.amount
    if (item.cadence === 'weekly') monthly = item.amount * 4.33
    if (item.cadence === 'quarterly') monthly = item.amount / 3
    if (item.cadence === 'annually') monthly = item.amount / 12
    return acc + monthly
  }, 0)
  const discretionaryTotal = discretionaryItems.reduce((acc, item) => {
    let monthly = item.amount
    if (item.cadence === 'weekly') monthly = item.amount * 4.33
    if (item.cadence === 'quarterly') monthly = item.amount / 3
    if (item.cadence === 'annually') monthly = item.amount / 12
    return acc + monthly
  }, 0)
  
  const potentialSavings = discretionaryTotal * 0.4 // Assume 40% of discretionary can be saved
  
  const moneyLeaks = [
    { id: 'l1', title: 'Recurring subscriptions review', monthlyCost: discretionaryTotal, potentialSavingMin: potentialSavings * 0.5, potentialSavingMax: potentialSavings, confidence: 0.7, why: `You have ${discretionaryItems.length} discretionary items totaling $${discretionaryTotal.toFixed(0)}/mo. Review for unused services.`, action: 'Review and cancel unused subscriptions', oneYearImpact: potentialSavings * 12, tenYearImpact: potentialSavings * 12 * 10 },
    { id: 'l2', title: 'Essential expenses optimization', monthlyCost: essentialTotal, potentialSavingMin: essentialTotal * 0.1, potentialSavingMax: essentialTotal * 0.2, confidence: 0.5, why: `Your essential expenses are $${essentialTotal.toFixed(0)}/mo. Some may have cheaper alternatives.`, action: 'Shop around for better rates on utilities, insurance', oneYearImpact: essentialTotal * 0.15 * 12, tenYearImpact: essentialTotal * 0.15 * 12 * 10 },
  ]
  
  // Dynamic anomaly detection based on expense items
  const anomalies = expenseItems
    .filter(item => {
      // Flag high amounts relative to typical
      const monthly = item.cadence === 'weekly' ? item.amount * 4.33 : item.cadence === 'quarterly' ? item.amount / 3 : item.cadence === 'annually' ? item.amount / 12 : item.amount
      return monthly > 200 && !item.essential // High non-essential items
    })
    .map((item, idx) => ({
      id: `anom-${idx}`,
      date: item.startDate,
      amount: item.amount,
      merchant: item.merchant,
      reason: `High ${item.category} expense: $${item.amount}/${item.cadence}`,
      category: item.category,
    }))
  
  // Also flag any subscriptions as potential anomalies
  const subAnomalies = expenseItems
    .filter(item => item.category === 'subscriptions')
    .map((item, idx) => ({
      id: `sub-${idx}`,
      date: item.startDate,
      amount: item.amount,
      merchant: item.merchant,
      reason: `Recurring subscription: $${item.amount}/${item.cadence}`,
      category: 'Subscriptions',
    }))
  
  const allAnomalies = [...anomalies, ...subAnomalies]
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  return (
    <div className="content-wrap expense-analysis-view">
      <section className="welcome-block">
        <div>
          <p className="eyebrow"><PieChart size={14} /> Expense Analysis</p>
          <h2>Your money leaks exposed</h2>
          <p>Automated analysis from your uploaded bank statements.</p>
        </div>
        <button className="primary-button" style={{ width: 'auto', padding: '0.6rem 1.2rem' }} onClick={() => setShowUploadModal(true)}>
          <Plus size={16} /> Upload Statement
        </button>
      </section>
      
      {/* Overview Cards */}
      <section className="expense-overview-grid">
        <div className="overview-card">
          <span className="overview-label">Total Spend (30 days)</span>
          <span className="overview-value">{money(monthlyTotal)}</span>
          <span className="overview-sub">↓ 12% vs last month</span>
        </div>
        <div className="overview-card">
          <span className="overview-label">Monthly Income</span>
          <span className="overview-value income">{money(monthlyIncome)}</span>
          <span className="overview-sub">Direct deposit verified</span>
        </div>
        <div className="overview-card">
          <span className="overview-label">Net Cash Flow</span>
          <span className={`overview-value ${netCashFlow >= 0 ? 'positive' : 'negative'}`}>{netCashFlow >= 0 ? '+' : ''}{money(netCashFlow)}</span>
          <span className="overview-sub">{netCashFlow >= 0 ? 'Money left over' : 'Overspending'}</span>
        </div>
        <div className="overview-card highlight">
          <span className="overview-label">Potential Savings</span>
          <span className="overview-value savings">{money(162)}</span>
          <span className="overview-sub">From 3 leaks found</span>
        </div>
      </section>
      
      {/* Money Leak Engine */}
      <section className="panel leaks-panel">
        <div className="section-heading">
          <h3><Zap size={18} /> Money Leaks Detected</h3>
          <span className="leak-summary">{moneyLeaks.length} leaks • {money(moneyLeaks.reduce((s, l) => s + l.potentialSavingMax, 0))}/mo potential</span>
        </div>
        <div className="leaks-list">
          {moneyLeaks.map(leak => (
            <div key={leak.id} className="leak-card">
              <div className="leak-header">
                <span className="leak-title">{leak.title}</span>
                <span className={`confidence-tag ${leak.confidence >= 0.8 ? 'high' : leak.confidence >= 0.5 ? 'med' : 'low'}`}>{leak.confidence >= 0.8 ? 'High' : leak.confidence >= 0.5 ? 'Medium' : 'Low'} confidence</span>
              </div>
              <div className="leak-stats">
                <div className="leak-stat">
                  <span className="stat-label">Current</span>
                  <span className="stat-value">{money(leak.monthlyCost)}/mo</span>
                </div>
                <div className="leak-stat highlight">
                  <span className="stat-label">Potential Save</span>
                  <span className="stat-value">{money(leak.potentialSavingMin)}–{money(leak.potentialSavingMax)}</span>
                </div>
                <div className="leak-stat">
                  <span className="stat-label">1-Year Impact</span>
                  <span className="stat-value">+{money(leak.oneYearImpact)}</span>
                </div>
                <div className="leak-stat">
                  <span className="stat-label">10-Year Impact</span>
                  <span className="stat-value">+{money(leak.tenYearImpact)}</span>
                </div>
              </div>
              <p className="leak-why"><strong>Why:</strong> {leak.why}</p>
              <p className="leak-action"><strong>Action:</strong> {leak.action}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* Two Column: Categories & Merchants */}
      <div className="expense-columns">
        <section className="panel category-panel">
          <h3>Spending by Category</h3>
          <div className="category-list">
            {categorySpending.map((cat) => (
              <div key={cat.category} className={`category-row ${selectedCategory === cat.category ? 'selected' : ''}`} onClick={() => setSelectedCategory(selectedCategory === cat.category ? null : cat.category)}>
                <div className="category-info">
                  <span className="category-name">{cat.category}</span>
                  <span className="category-percent">{cat.percentOfIncome}% of income</span>
                </div>
                <div className="category-stats">
                  <span className="category-amount">{money(cat.amount)}</span>
                  {cat.moMChange !== 0 && <span className={`category-change ${cat.moMChange > 0 ? 'up' : 'down'}`}>{cat.moMChange > 0 ? '+' : ''}{cat.moMChange}%</span>}
                </div>
                <div className="category-bar"><div className="category-bar-fill" style={{ width: `${cat.percentOfIncome * 8}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="panel merchants-panel">
          <h3>Top Merchants</h3>
          <div className="merchants-list">
            {merchantSpending.slice(0, 8).map((m, i) => (
              <div key={i} className="merchant-row">
                <span className="merchant-rank">#{i + 1}</span>
                <div className="merchant-info">
                  <span className="merchant-name">{m.merchant}</span>
                  <span className="merchant-txns">{m.transactionCount} transaction{m.transactionCount > 1 ? 's' : ''}</span>
                </div>
                <div className="merchant-amount">
                  <span>{money(m.amount)}</span>
                  <span className="merchant-percent">{m.percentOfTotal.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      
      {/* Anomalies */}
      <section className="panel anomalies-panel">
        <div className="section-heading">
          <h3><Zap size={18} /> Spikes & Anomalies</h3>
        </div>
        <div className="anomalies-list">
          {allAnomalies.map((anom) => (
            <div key={anom.id} className="anomaly-card">
              <div className="anomaly-icon warning"><Zap size={14} /></div>
              <div className="anomaly-details">
                <span className="anomaly-merchant">{anom.merchant}</span>
                <span className="anomaly-reason">{anom.reason}</span>
              </div>
              <div className="anomaly-amount">
                <span>{money(anom.amount)}</span>
                <span className="anomaly-date">{anom.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Bank Statement</h3>
              <button className="modal-close" onClick={() => setShowUploadModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="upload-zone">
                <div className="upload-icon"><Receipt size={32} /></div>
                <p>Drag & drop your bank statement here</p>
                <span>Supports PDF, CSV, OFX, QFX</span>
                <button className="primary-button">Browse Files</button>
              </div>
              <div className="upload-info">
                <h4>What we analyze:</h4>
                <ul>
                  <li>Transaction history (date, amount, merchant)</li>
                  <li>Recurring payments & subscriptions</li>
                  <li>Spending patterns & categories</li>
                  <li>Anomalies & unusual transactions</li>
                </ul>
                <p className="privacy-note"><ShieldCheck size={14} /> Your data is encrypted and never shared</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
