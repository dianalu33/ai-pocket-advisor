import { NextResponse } from 'next/server'

type Input = { age: number; salary: number; otherIncome: number; expenses: number; debt: number; emergencySavings: number; goal: string; timeline: number; risk: 'conservative' | 'balanced' | 'growth'; interests: string[] }

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<Input> | null
  if (!body || !Number.isFinite(body.age) || !Number.isFinite(body.salary) || !Number.isFinite(body.expenses) || !Number.isFinite(body.emergencySavings) || !body.risk) return NextResponse.json({ error: 'Please provide the required financial inputs.' }, { status: 400 })
  const age = clamp(Number(body.age), 18, 100)
  const salary = Math.max(0, Number(body.salary))
  const otherIncome = Math.max(0, Number(body.otherIncome ?? 0))
  const expenses = Math.max(1, Number(body.expenses))
  const debt = Math.max(0, Number(body.debt ?? 0))
  const emergencySavings = Math.max(0, Number(body.emergencySavings))
  const timeline = Math.max(1, Number(body.timeline ?? 10))
  const interests = Array.isArray(body.interests) ? body.interests : []
  const takeHome = (salary + otherIncome) * 0.72 / 12
  const available = Math.max(0, takeHome - expenses)
  const emergencyTarget = expenses * (debt > salary * 0.25 ? 6 : 4)
  const emergencyGap = Math.max(0, emergencyTarget - emergencySavings)
  const pressure = clamp((debt / Math.max(salary, 1)) * 100 + (emergencyGap / Math.max(emergencyTarget, 1)) * 25, 0, 45)
  const base = body.risk === 'conservative' ? { cash: 25, bonds: 35, index: 25, reits: 10, crypto: 5 } : body.risk === 'growth' ? { cash: 8, bonds: 12, index: 55, reits: 12, crypto: 13 } : { cash: 15, bonds: 22, index: 43, reits: 12, crypto: 8 }
  const ageShift = clamp((age - 30) * 0.35, -8, 14)
  const horizonShift = timeline <= 3 ? 12 : timeline >= 15 ? -7 : 0
  const liquidityBoost = emergencyGap > 0 ? clamp(pressure * 0.35, 0, 15) : 0
  let cash = Math.round(base.cash + liquidityBoost + horizonShift * 0.4)
  let bonds = Math.round(base.bonds + ageShift * 0.6 + horizonShift * 0.2)
  let index = Math.round(base.index - ageShift * 0.4 - horizonShift * 0.35)
  let reits = Math.round(base.reits + (interests.includes('REITs') ? 4 : 0))
  let crypto = Math.round(base.crypto + (interests.includes('Crypto') && body.risk !== 'conservative' ? 3 : 0))
  crypto = clamp(crypto, 0, 15)
  const total = cash + bonds + index + reits + crypto
  index += 100 - total
  const allocation = [
    { name: 'HYSA / cash', value: cash, color: '--aqua', reason: emergencyGap > 0 ? 'close your liquidity gap' : 'keep near-term cash ready' },
    { name: 'Bonds', value: bonds, color: '--gold', reason: 'smooth the ride' },
    { name: 'Index funds', value: index, color: '--violet', reason: 'compound patiently' },
    { name: 'REITs / real estate', value: reits, color: '--coral', reason: 'add a real-asset sleeve' },
    { name: 'Crypto', value: crypto, color: '--mint', reason: 'keep optional upside capped' },
  ]
  const monthlyContribution = Math.round(clamp(available * (body.risk === 'conservative' ? 0.35 : 0.55), 100, Math.max(100, available)))
  const profileLabel = body.risk === 'conservative' ? 'capital-preservation' : body.risk === 'growth' ? 'growth-oriented' : 'balanced'
  return NextResponse.json({ profileLabel, allocation, monthlyContribution, emergencyTarget: Math.round(emergencyTarget), emergencyGap: Math.round(emergencyGap), rationale: [emergencyGap > 0 ? `Your cash sleeve prioritizes ${Math.round(emergencyGap / Math.max(expenses, 1))} months of runway before extra risk.` : 'Your emergency reserve gives the long-term allocation more room to work.', debt > salary * 0.2 ? 'High-interest debt should compete with investing for your next dollar.' : 'Your debt load is not currently dominating the plan.', timeline <= 3 ? 'A shorter goal timeline favors stability over market timing.' : 'Your timeline supports diversified exposure to long-term growth.'], risks: [crypto > 10 ? 'Crypto can move sharply; keep this sleeve capped and rebalance.' : 'Even diversified markets can fall; avoid investing money needed soon.', debt > 0 ? 'Review interest rates and prioritize expensive debt.' : 'Revisit your mix when your goals, income, or runway change.'], actions: [emergencyGap > 0 ? `Automate ${money(Math.min(emergencyGap, monthlyContribution))} monthly toward your emergency fund.` : `Automate ${money(monthlyContribution)} monthly across the allocation.`, 'Compare fees, tax treatment, and liquidity before choosing any product.', 'Set a quarterly calendar reminder to review, not react.'], ideas: [interests.includes('Index funds') ? 'Low-cost total-market index fund' : 'Broad diversified index fund', interests.includes('HYSA') ? 'FDIC-insured high-yield savings account' : 'Short-duration Treasury or bond fund', interests.includes('Crypto') ? 'A capped, diversified crypto sleeve' : 'Public REIT or diversified real estate fund'] })
}

function money(value: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value) }
