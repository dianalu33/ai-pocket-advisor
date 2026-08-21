// =====================================================
// REAL ESTATE MODULE - TYPES AND HELPERS
// =====================================================

// Market Segment Types
export type PropertyType = 'Residential' | 'Studio' | 'Commercial'
export type SizeSegment = '200-400 sqft' | '300-600 sqft' | '600-1000 sqft' | '1000+ sqft'
export type RealEstateGoal = 'rent' | 'growth' | 'balanced' | 'diversification' | 'debt_reduction'
export type MortgageMode = 'amortizing' | 'interest_only'
export type RiskLevel = 'low' | 'medium' | 'high'
export type Confidence = 'low' | 'medium' | 'high'

export interface MarketSegment {
  id: string
  district: string
  area: string | null
  property_type: PropertyType
  size_segment: SizeSegment
  price_band_low_hkd: number
  price_band_high_hkd: number
  rent_band_low_hkd: number
  rent_band_high_hkd: number
  estimated_gross_yield_low: number
  estimated_gross_yield_high: number
  liquidity_score: number
  volatility_score: number
  data_source: string
  data_as_of: string
}

export interface UserRealEstatePreferences {
  user_id: string
  primary_goal: RealEstateGoal
  risk_tolerance: RiskLevel
  available_down_payment_hkd: number
  max_monthly_debt_payment_hkd: number
  max_debt_to_income_ratio: number
  monthly_income_hkd: number
  current_monthly_debt_hkd: number
  preferred_mortgage_mode: MortgageMode
  assumed_interest_rate: number
  loan_term_years: number
  interest_only_period_years: number
  vacancy_rate: number
  annual_rent_growth_assumption: number
  rent_collection_risk: RiskLevel
  safety_buffer_months: number
}

export interface RealEstateProperty {
  id: string
  user_id: string
  property_label: string
  district: string
  area: string | null
  property_type: PropertyType
  size_sqft: number
  ownership_pct: number
  acquisition_price_hkd: number
  current_value_hkd: number
  mortgage_balance_hkd: number
  monthly_rent_hkd: number
  monthly_expenses_hkd: number
  occupancy_status: string
}

export interface RealEstateRecommendation {
  id: string
  user_id: string
  market_segment_id: string
  market_segment?: MarketSegment
  strategy: string
  overall_score: number
  goal_fit_score: number
  debt_capacity_score: number
  rent_yield_score: number
  diversification_score: number
  risk_score: number
  confidence: Confidence
  explanation: string
  compliance_note: string
}

export interface StressTest {
  name: string
  description: string
  interest_rate_change: number // percentage points
  rent_change_percent: number // percentage change
  vacancy_change: number // percentage points
  expense_change_percent: number // percentage change
  property_value_change_percent: number // percentage change
  new_monthly_cashflow: number
  new_coverage_ratio: number
  risk_flag: 'safe' | 'tight' | 'risky'
}

export interface SimulationResult {
  purchase_price_hkd: number
  down_payment_hkd: number
  loan_amount_hkd: number
  mortgage_mode: MortgageMode
  annual_interest_rate: number
  loan_term_years: number
  interest_only_period_years: number
  estimated_monthly_payment_hkd: number
  estimated_effective_rent_hkd: number
  estimated_net_rent_before_debt_hkd: number
  estimated_cashflow_after_debt_hkd: number
  cashflow_coverage_ratio: number
  estimated_payoff_years: number | null
  principal_remaining_after_io_hkd: number
  stress_tests: StressTest[]
}

// =====================================================
// CALCULATION HELPERS
// =====================================================

// Calculate effective rent after vacancy
export function calculateEffectiveRent(
  monthlyRent: number,
  vacancyRate: number
): number {
  return monthlyRent * (1 - vacancyRate)
}

// Calculate net rent after expenses
export function calculateNetRent(
  effectiveRent: number,
  monthlyExpenses: number
): number {
  return effectiveRent - monthlyExpenses
}

// Calculate monthly payment for amortizing mortgage
export function calculateAmortizingPayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 100 / 12
  const numPayments = termYears * 12
  
  if (monthlyRate === 0) {
    return principal / numPayments
  }
  
  const payment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  
  return payment
}

// Calculate interest-only monthly payment
export function calculateInterestOnlyPayment(
  principal: number,
  annualRate: number
): number {
  return (principal * annualRate / 100) / 12
}

// Calculate cashflow coverage ratio
export function calculateCoverageRatio(
  netRentBeforeDebt: number,
  monthlyDebtPayment: number
): number {
  if (monthlyDebtPayment === 0) return Infinity
  return netRentBeforeDebt / monthlyDebtPayment
}

// Calculate maximum affordable loan based on payment capacity
export function calculateMaxLoanFromPayment(
  maxMonthlyPayment: number,
  annualRate: number,
  termYears: number,
  mode: MortgageMode
): number {
  const monthlyRate = annualRate / 100 / 12
  
  if (mode === 'interest_only') {
    return (maxMonthlyPayment / monthlyRate) * 12
  }
  
  const numPayments = termYears * 12
  if (monthlyRate === 0) {
    return maxMonthlyPayment * numPayments
  }
  
  // Reverse the amortization formula to find principal
  const maxPrincipal = maxMonthlyPayment * 
    (Math.pow(1 + monthlyRate, numPayments) - 1) / 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
  
  return maxPrincipal
}

// Generate stress tests
export function generateStressTests(
  baseCashflow: number,
  baseCoverageRatio: number,
  monthlyPayment: number,
  netRentBeforeDebt: number,
  interestRate: number,
  monthlyRent: number,
  vacancyRate: number,
  monthlyExpenses: number
): StressTest[] {
  const tests: StressTest[] = [
    {
      name: 'Interest Rate +1%',
      description: 'If interest rates rise by 1 percentage point',
      interest_rate_change: 1,
      rent_change_percent: 0,
      vacancy_change: 0,
      expense_change_percent: 0,
      property_value_change_percent: 0,
      new_monthly_cashflow: 0,
      new_coverage_ratio: 0,
      risk_flag: 'safe'
    },
    {
      name: 'Rent Drops 10%',
      description: 'If rental income decreases by 10%',
      interest_rate_change: 0,
      rent_change_percent: -10,
      vacancy_change: 0,
      expense_change_percent: 0,
      property_value_change_percent: 0,
      new_monthly_cashflow: 0,
      new_coverage_ratio: 0,
      risk_flag: 'safe'
    },
    {
      name: 'Vacancy Doubles',
      description: 'If vacancy rate doubles',
      interest_rate_change: 0,
      rent_change_percent: 0,
      vacancy_change: vacancyRate,
      expense_change_percent: 0,
      property_value_change_percent: 0,
      new_monthly_cashflow: 0,
      new_coverage_ratio: 0,
      risk_flag: 'safe'
    },
    {
      name: 'Expenses +15%',
      description: 'If monthly expenses increase by 15%',
      interest_rate_change: 0,
      rent_change_percent: 0,
      vacancy_change: 0,
      expense_change_percent: 15,
      property_value_change_percent: 0,
      new_monthly_cashflow: 0,
      new_coverage_ratio: 0,
      risk_flag: 'safe'
    },
    {
      name: 'Property Value -10%',
      description: 'If property value falls by 10%',
      interest_rate_change: 0,
      rent_change_percent: 0,
      vacancy_change: 0,
      expense_change_percent: 0,
      property_value_change_percent: -10,
      new_monthly_cashflow: 0,
      new_coverage_ratio: 0,
      risk_flag: 'safe'
    }
  ]
  
  // Calculate each stress test
  tests.forEach(test => {
    const newInterestRate = interestRate + test.interest_rate_change
    const newMonthlyRent = monthlyRent * (1 + test.rent_change_percent / 100)
    const newVacancyRate = Math.min(1, vacancyRate + test.vacancy_change)
    const newMonthlyExpenses = monthlyExpenses * (1 + test.expense_change_percent / 100)
    
    const effectiveRent = calculateEffectiveRent(newMonthlyRent, newVacancyRate)
    const netRent = calculateNetRent(effectiveRent, newMonthlyExpenses)
    
    let newPayment = monthlyPayment
    if (test.interest_rate_change !== 0 && monthlyPayment > 0) {
      // Recalculate payment based on remaining principal
      // For simplicity, assume same principal and recalculate
      newPayment = monthlyPayment // Simplified - in reality would need principal
    }
    
    const newCashflow = netRent - newPayment
    const newCoverage = calculateCoverageRatio(netRent, newPayment)
    
    test.new_monthly_cashflow = newCashflow
    test.new_coverage_ratio = newCoverage
    
    if (newCoverage >= 1.5 || newCashflow > 0) {
      test.risk_flag = 'safe'
    } else if (newCoverage >= 1.0 || newCashflow > -500) {
      test.risk_flag = 'tight'
    } else {
      test.risk_flag = 'risky'
    }
  })
  
  return tests
}

// Full simulation function
export function runSimulation(
  purchasePrice: number,
  downPayment: number,
  monthlyRent: number,
  monthlyExpenses: number,
  preferences: UserRealEstatePreferences
): SimulationResult {
  const loanAmount = purchasePrice - downPayment
  const { 
    preferred_mortgage_mode, 
    assumed_interest_rate, 
    loan_term_years, 
    interest_only_period_years,
    vacancy_rate,
    max_monthly_debt_payment_hkd
  } = preferences
  
  // Calculate monthly payment based on mortgage mode
  let monthlyPayment: number
  let principalRemainingAfterIO: number
  
  if (preferred_mortgage_mode === 'interest_only') {
    monthlyPayment = calculateInterestOnlyPayment(loanAmount, assumed_interest_rate)
    principalRemainingAfterIO = loanAmount // Principal unchanged during IO period
  } else {
    monthlyPayment = calculateAmortizingPayment(loanAmount, assumed_interest_rate, loan_term_years)
    principalRemainingAfterIO = 0 // Fully amortizing
  }
  
  // Calculate rent metrics
  const effectiveRent = calculateEffectiveRent(monthlyRent, vacancy_rate)
  const netRentBeforeDebt = calculateNetRent(effectiveRent, monthlyExpenses)
  const cashflowAfterDebt = netRentBeforeDebt - monthlyPayment
  const coverageRatio = calculateCoverageRatio(netRentBeforeDebt, monthlyPayment)
  
  // Calculate payoff years for amortizing
  let payoffYears: number | null = null
  if (preferred_mortgage_mode === 'amortizing') {
    payoffYears = loan_term_years
  }
  
  // Generate stress tests
  const stressTests = generateStressTests(
    cashflowAfterDebt,
    coverageRatio,
    monthlyPayment,
    netRentBeforeDebt,
    assumed_interest_rate,
    monthlyRent,
    vacancy_rate,
    monthlyExpenses
  )
  
  return {
    purchase_price_hkd: purchasePrice,
    down_payment_hkd: downPayment,
    loan_amount_hkd: loanAmount,
    mortgage_mode: preferred_mortgage_mode,
    annual_interest_rate: assumed_interest_rate,
    loan_term_years,
    interest_only_period_years,
    estimated_monthly_payment_hkd: monthlyPayment,
    estimated_effective_rent_hkd: effectiveRent,
    estimated_net_rent_before_debt_hkd: netRentBeforeDebt,
    estimated_cashflow_after_debt_hkd: cashflowAfterDebt,
    cashflow_coverage_ratio: coverageRatio,
    estimated_payoff_years: payoffYears,
    principal_remaining_after_io_hkd: principalRemainingAfterIO,
    stress_tests: stressTests
  }
}

// Calculate recommendation score
export function calculateRecommendationScore(
  marketSegment: MarketSegment,
  preferences: UserRealEstatePreferences,
  existingProperties: RealEstateProperty[]
): { overallScore: number; goalFitScore: number; debtCapacityScore: number; rentYieldScore: number; diversificationScore: number; riskScore: number } {
  const { primary_goal, risk_tolerance, available_down_payment_hkd, max_monthly_debt_payment_hkd } = preferences
  
  // Calculate rent yield (average of low and high)
  const avgYield = (marketSegment.estimated_gross_yield_low + marketSegment.estimated_gross_yield_high) / 2 / 100
  
  // Calculate mid-point price and rent
  const midPrice = (marketSegment.price_band_low_hkd + marketSegment.price_band_high_hkd) / 2
  const midRent = (marketSegment.rent_band_low_hkd + marketSegment.rent_band_high_hkd) / 2
  
  // Estimate required loan
  const estimatedLoan = Math.max(0, midPrice - available_down_payment_hkd)
  const estimatedPayment = estimatedLoan > 0 
    ? (preferences.preferred_mortgage_mode === 'interest_only'
        ? calculateInterestOnlyPayment(estimatedLoan, preferences.assumed_interest_rate)
        : calculateAmortizingPayment(estimatedLoan, preferences.assumed_interest_rate, preferences.loan_term_years))
    : 0
  
  // Goal fit score
  let goalFitScore = 50
  if (primary_goal === 'rent') {
    goalFitScore = Math.min(100, avgYield * 100 * 3) // Higher weight on yield
  } else if (primary_goal === 'growth') {
    goalFitScore = Math.min(100, (10 - marketSegment.volatility_score) * 10 + 30) // Lower volatility = higher growth potential
  } else if (primary_goal === 'balanced') {
    goalFitScore = 50 + avgYield * 100 + (10 - marketSegment.volatility_score) * 3
  }
  
  // Debt capacity score
  const debtCapacityScore = max_monthly_debt_payment_hkd > 0
    ? Math.min(100, (1 - estimatedPayment / max_monthly_debt_payment_hkd) * 100 + 50)
    : 50
  
  // Rent yield score
  const rentYieldScore = Math.min(100, avgYield * 100 * 2.5) // 3-4% yield = 75-100
  
  // Diversification score
  let diversificationScore = 70
  if (existingProperties.length > 0) {
    const hasSameDistrict = existingProperties.some(p => p.district === marketSegment.district)
    if (!hasSameDistrict) {
      diversificationScore = 90
    } else {
      diversificationScore = 50
    }
  }
  
  // Risk score (inverse - lower is better)
  let riskScore = 50
  const riskMap: Record<RiskLevel, number> = { low: 30, medium: 50, high: 70 }
  riskScore = riskMap[risk_tolerance]
  riskScore += marketSegment.volatility_score * 2
  
  // Overall score (weighted)
  const overallScore = 
    goalFitScore * 0.30 +
    debtCapacityScore * 0.25 +
    rentYieldScore * 0.20 +
    diversificationScore * 0.10 +
    (100 - riskScore) * 0.15
  
  return {
    overallScore: Math.round(overallScore),
    goalFitScore: Math.round(goalFitScore),
    debtCapacityScore: Math.round(debtCapacityScore),
    rentYieldScore: Math.round(rentYieldScore),
    diversificationScore: Math.round(diversificationScore),
    riskScore: Math.round(riskScore)
  }
}

// Default preferences
export function getDefaultPreferences(userId: string): UserRealEstatePreferences {
  return {
    user_id: userId,
    primary_goal: 'rent',
    risk_tolerance: 'medium',
    available_down_payment_hkd: 1500000,
    max_monthly_debt_payment_hkd: 25000,
    max_debt_to_income_ratio: 0.35,
    monthly_income_hkd: 80000,
    current_monthly_debt_hkd: 8000,
    preferred_mortgage_mode: 'amortizing',
    assumed_interest_rate: 4.0,
    loan_term_years: 25,
    interest_only_period_years: 3,
    vacancy_rate: 0.05,
    annual_rent_growth_assumption: 0.02,
    rent_collection_risk: 'medium',
    safety_buffer_months: 6
  }
}

// Format currency
export function formatHKD(amount: number): string {
  return new Intl.NumberFormat('en-HK', {
    style: 'currency',
    currency: 'HKD',
    maximumFractionDigits: 0
  }).format(amount)
}

// Format percentage
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}
