// Real Estate View Component
// Hong Kong Property Opportunity Recommendations

import { useState, useMemo } from 'react'
import { Building2, Home, TrendingUp, Calculator, AlertTriangle, ChevronDown, Info, RefreshCw } from 'lucide-react'

// Types for Real Estate Module
type PropertySegment = {
  id: string
  district: string
  area: string
  propertyType: string
  sizeSegment: string
  priceBandLow: number
  priceBandHigh: number
  rentBandLow: number
  rentBandHigh: number
  yieldLow: number
  yieldHigh: number
  liquidityScore: number
  volatilityScore: number
}

type UserPreferences = {
  primaryGoal: 'rent' | 'growth' | 'balanced' | 'diversification' | 'debt_reduction'
  riskTolerance: 'low' | 'medium' | 'high'
  downPayment: number
  maxMonthlyDebt: number
  maxDebtToIncome: number
  monthlyIncome: number
  currentMonthlyDebt: number
  mortgageMode: 'amortizing' | 'interest_only'
  interestRate: number
  loanTermYears: number
  interestOnlyYears: number
  vacancyRate: number
  annualRentGrowth: number
  rentCollectionRisk: 'low' | 'medium' | 'high'
  safetyBufferMonths: number
}

type MortgageCalculation = {
  loanAmount: number
  monthlyPayment: number
  totalInterest: number
  payoffYears: number
  principalAfterIO: number
}

// Sample market segments (HK districts) with website links
const sampleSegments: PropertySegment[] = [
  { id: '1', district: 'Kowloon City', area: 'Ho Man Tin', propertyType: 'Residential', sizeSegment: '300-600 sqft', priceBandLow: 4500000, priceBandHigh: 7000000, rentBandLow: 13000, rentBandHigh: 21000, yieldLow: 0.032, yieldHigh: 0.038, liquidityScore: 0.72, volatilityScore: 0.28 },
  { id: '2', district: 'Kowloon City', area: 'To Kwa Wan', propertyType: 'Residential', sizeSegment: '300-600 sqft', priceBandLow: 3800000, priceBandHigh: 5800000, rentBandLow: 11000, rentBandHigh: 17000, yieldLow: 0.034, yieldHigh: 0.042, liquidityScore: 0.68, volatilityScore: 0.25 },
  { id: '3', district: 'Central & Western', area: 'Central', propertyType: 'Residential', sizeSegment: '300-600 sqft', priceBandLow: 5500000, priceBandHigh: 9000000, rentBandLow: 16000, rentBandHigh: 28000, yieldLow: 0.028, yieldHigh: 0.035, liquidityScore: 0.85, volatilityScore: 0.4 },
  { id: '4', district: 'Eastern', area: 'North Point', propertyType: 'Residential', sizeSegment: '300-600 sqft', priceBandLow: 4200000, priceBandHigh: 6800000, rentBandLow: 13000, rentBandHigh: 20000, yieldLow: 0.032, yieldHigh: 0.04, liquidityScore: 0.75, volatilityScore: 0.3 },
  { id: '5', district: 'Sha Tin', area: 'Sha Tin Town Centre', propertyType: 'Residential', sizeSegment: '300-600 sqft', priceBandLow: 3800000, priceBandHigh: 6000000, rentBandLow: 11000, rentBandHigh: 18000, yieldLow: 0.032, yieldHigh: 0.04, liquidityScore: 0.65, volatilityScore: 0.22 },
  { id: '6', district: 'Tuen Mun', area: 'Tuen Mun Town Centre', propertyType: 'Residential', sizeSegment: '300-600 sqft', priceBandLow: 3200000, priceBandHigh: 5000000, rentBandLow: 9000, rentBandHigh: 15000, yieldLow: 0.035, yieldHigh: 0.045, liquidityScore: 0.55, volatilityScore: 0.18 },
  { id: '7', district: 'Yuen Long', area: 'Yuen Long Town', propertyType: 'Residential', sizeSegment: '300-600 sqft', priceBandLow: 3000000, priceBandHigh: 4800000, rentBandLow: 8500, rentBandHigh: 14000, yieldLow: 0.036, yieldHigh: 0.048, liquidityScore: 0.5, volatilityScore: 0.15 },
  { id: '8', district: 'Kowloon City', area: 'Kowloon Tong', propertyType: 'Residential', sizeSegment: '300-600 sqft', priceBandLow: 5000000, priceBandHigh: 8000000, rentBandLow: 15000, rentBandHigh: 24000, yieldLow: 0.03, yieldHigh: 0.036, liquidityScore: 0.78, volatilityScore: 0.33 },
]

// Real estate website URLs by district
const districtWebsites: Record<string, { name: string; url: string }[]> = {
  'Kowloon City': [
    { name: 'Property HK', url: 'https://www.propertyhk.com.hk/transaction/kowloon-city-district/' },
    { name: 'Squarefoot', url: 'https://www.squarefoot.com.hk/search?district=kowloon-city' },
    { name: 'Spacious', url: 'https://www.spacious.hk/en/list/ki/' },
  ],
  'Central & Western': [
    { name: 'Property HK', url: 'https://www.propertyhk.com.hk/transaction/central-western-district/' },
    { name: 'Squarefoot', url: 'https://www.squarefoot.com.hk/search?district=central' },
    { name: 'Spacious', url: 'https://www.spacious.hk/en/list/hk/' },
  ],
  'Eastern': [
    { name: 'Property HK', url: 'https://www.propertyhk.com.hk/transaction/eastern-district/' },
    { name: 'Squarefoot', url: 'https://www.squarefoot.com.hk/search?district=eastern' },
    { name: 'Spacious', url: 'https://www.spacious.hk/en/list/eh/' },
  ],
  'Sha Tin': [
    { name: 'Property HK', url: 'https://www.propertyhk.com.hk/transaction/sha-tin-district/' },
    { name: 'Squarefoot', url: 'https://www.squarefoot.com.hk/search?district=sha-tin' },
    { name: 'Spacious', url: 'https://www.spacious.hk/en/list/st/' },
  ],
  'Tuen Mun': [
    { name: 'Property HK', url: 'https://www.propertyhk.com.hk/transaction/tuen-mun-district/' },
    { name: 'Squarefoot', url: 'https://www.squarefoot.com.hk/search?district=tuen-mun' },
    { name: 'Spacious', url: 'https://www.spacious.hk/en/list/tm/' },
  ],
  'Yuen Long': [
    { name: 'Property HK', url: 'https://www.propertyhk.com.hk/transaction/yuen-long-district/' },
    { name: 'Squarefoot', url: 'https://www.squarefoot.com.hk/search?district=yuen-long' },
    { name: 'Spacious', url: 'https://www.spacious.hk/en/list/yl/' },
  ],
}

// Format HKD currency
const formatHKD = (amount: number): string => {
  return new Intl.NumberFormat('en-HK', { style: 'currency', currency: 'HKD', maximumFractionDigits: 0 }).format(amount)
}

// Calculate mortgage
const calculateMortgage = (
  principal: number,
  annualRate: number,
  termYears: number,
  mode: 'amortizing' | 'interest_only',
  ioYears?: number
): MortgageCalculation => {
  const monthlyRate = annualRate / 100 / 12
  const totalMonths = termYears * 12
  const ioMonths = (ioYears || 0) * 12
  
  let monthlyPayment: number
  let totalInterest: number
  let principalAfterIO: number
  
  if (mode === 'interest_only') {
    monthlyPayment = principal * monthlyRate
    totalInterest = monthlyPayment * ioMonths
    principalAfterIO = principal // Principal unchanged during IO period
  } else {
    // Amortizing formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1)
    totalInterest = (monthlyPayment * totalMonths) - principal
    principalAfterIO = 0
  }
  
  return {
    loanAmount: principal,
    monthlyPayment,
    totalInterest,
    payoffYears: mode === 'amortizing' ? termYears : ioYears || 0,
    principalAfterIO
  }
}

// Calculate cashflow
const calculateCashflow = (
  monthlyRent: number,
  vacancyRate: number,
  monthlyExpenses: number,
  monthlyDebtPayment: number
) => {
  const effectiveRent = monthlyRent * (1 - vacancyRate)
  const netRent = effectiveRent - monthlyExpenses
  const cashflow = netRent - monthlyDebtPayment
  const coverageRatio = monthlyDebtPayment > 0 ? netRent / monthlyDebtPayment : 999
  
  return { effectiveRent, netRent, cashflow, coverageRatio }
}

export function RealEstateView({ language = 'en', userId }: { language?: 'en' | 'yue' | 'zh', userId?: string }) {
  const [activeTab, setActiveTab] = useState<'recommendations' | 'simulator' | 'settings'>('recommendations')
  const [selectedSegment, setSelectedSegment] = useState<PropertySegment | null>(null)
  const [showSimulation, setShowSimulation] = useState(false)
  
  // User preferences state
  const [prefs, setPrefs] = useState<UserPreferences>({
    primaryGoal: 'rent',
    riskTolerance: 'medium',
    downPayment: 1500000,
    maxMonthlyDebt: 25000,
    maxDebtToIncome: 0.35,
    monthlyIncome: 80000,
    currentMonthlyDebt: 8000,
    mortgageMode: 'interest_only',
    interestRate: 4.0,
    loanTermYears: 25,
    interestOnlyYears: 3,
    vacancyRate: 0.05,
    annualRentGrowth: 0.03,
    rentCollectionRisk: 'medium',
    safetyBufferMonths: 6
  })
  
  // Simulation inputs
  const [simPrice, setSimPrice] = useState(5000000)
  const [simDownPayment, setSimDownPayment] = useState(1500000)
  
  // Calculate max affordable loan
  const maxAffordableLoan = useMemo(() => {
    // Based on monthly payment capacity
    const availableForDebt = prefs.maxMonthlyDebt - prefs.currentMonthlyDebt
    const monthlyRate = prefs.interestRate / 100 / 12
    
    if (prefs.mortgageMode === 'interest_only') {
      return availableForDebt / monthlyRate
    } else {
      const termMonths = prefs.loanTermYears * 12
      return availableForDebt * (Math.pow(1 + monthlyRate, termMonths) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, termMonths))
    }
  }, [prefs])
  
  const maxPropertyBudget = prefs.downPayment + maxAffordableLoan
  
  // Filter and score segments based on user preferences
  const scoredSegments = useMemo(() => {
    return sampleSegments.map(segment => {
      let score = 50
      
      // Goal fit scoring
      if (prefs.primaryGoal === 'rent') {
        const avgYield = (segment.yieldLow + segment.yieldHigh) / 2
        score += (avgYield - 0.03) * 500 // Higher yield = better for rent goal
      } else if (prefs.primaryGoal === 'growth') {
        score += segment.liquidityScore * 30 // Higher liquidity = better for growth
      }
      
      // Budget fit
      const avgPrice = (segment.priceBandLow + segment.priceBandHigh) / 2
      if (avgPrice <= maxPropertyBudget) score += 20
      else if (avgPrice <= maxPropertyBudget * 1.2) score += 10
      
      // Risk fit
      if (prefs.riskTolerance === 'low' && segment.volatilityScore < 0.3) score += 15
      else if (prefs.riskTolerance === 'high') score += 10
      
      return { ...segment, score: Math.min(100, Math.max(0, score)) }
    }).sort((a, b) => b.score - a.score)
  }, [prefs, maxPropertyBudget])
  
  // Simulation calculation
  const simulation = useMemo(() => {
    const loanAmount = simPrice - simDownPayment
    const mortgage = calculateMortgage(loanAmount, prefs.interestRate, prefs.loanTermYears, prefs.mortgageMode, prefs.interestOnlyYears)
    const avgRent = (selectedSegment?.rentBandLow || 15000 + selectedSegment?.rentBandHigh || 20000) / 2
    const cashflow = calculateCashflow(avgRent, prefs.vacancyRate, 2000, mortgage.monthlyPayment)
    
    return { ...mortgage, ...cashflow }
  }, [simPrice, simDownPayment, prefs, selectedSegment])
  
  // Stress tests
  const stressTests = useMemo(() => {
    const baseRent = (selectedSegment?.rentBandLow || 13000 + selectedSegment?.rentBandHigh || 18000) / 2
    const basePayment = simulation.monthlyPayment
    
    return [
      { name: 'Interest rate +1%', impact: 'payment', change: 1, newPayment: calculateMortgage(simPrice - simDownPayment, prefs.interestRate + 1, prefs.loanTermYears, prefs.mortgageMode, prefs.interestOnlyYears).monthlyPayment },
      { name: 'Rent drops 10%', impact: 'rent', change: -0.10, newCashflow: calculateCashflow(baseRent * 0.9, prefs.vacancyRate, 2000, basePayment).cashflow },
      { name: 'Vacancy doubles', impact: 'vacancy', change: 1, newCashflow: calculateCashflow(baseRent, prefs.vacancyRate * 2, 2000, basePayment).cashflow },
      { name: 'Expenses +15%', impact: 'expenses', change: 0.15, newCashflow: calculateCashflow(baseRent, prefs.vacancyRate, 2000 * 1.15, basePayment).cashflow },
    ]
  }, [simulation, simPrice, simDownPayment, prefs, selectedSegment])
  
  return (
    <div className="content-wrap real-estate-view">
      <section className="welcome-block">
        <div>
          <p className="eyebrow"><Building2 size={14} /> Real Estate</p>
          <h2>HK Property Opportunities</h2>
          <p>AI-powered recommendations for Hong Kong property investment</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <RefreshCw size={12} /> Updated daily
          </span>
        </div>
      </section>
      
      {/* Tab Navigation */}
      <div className="re-tabs">
        <button className={`re-tab ${activeTab === 'recommendations' ? 'active' : ''}`} onClick={() => setActiveTab('recommendations')}>
          <TrendingUp size={16} /> Recommendations
        </button>
        <button className={`re-tab ${activeTab === 'simulator' ? 'active' : ''}`} onClick={() => setActiveTab('simulator')}>
          <Calculator size={16} /> Mortgage Simulator
        </button>
        <button className={`re-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <Home size={16} /> My Preferences
        </button>
      </div>
      
      {activeTab === 'recommendations' && (
        <div className="re-content">
          {/* Filter Summary */}
          <div className="re-summary">
            <div className="re-summary-item">
              <span className="label">Goal</span>
              <span className="value">{prefs.primaryGoal === 'rent' ? 'Rent / Income' : prefs.primaryGoal}</span>
            </div>
            <div className="re-summary-item">
              <span className="label">Max Budget</span>
              <span className="value">{formatHKD(maxPropertyBudget)}</span>
            </div>
            <div className="re-summary-item">
              <span className="label">Risk</span>
              <span className="value">{prefs.riskTolerance}</span>
            </div>
          </div>
          
          {/* Segment Cards */}
          <div className="segment-grid">
            {scoredSegments.slice(0, 6).map(segment => (
              <div 
                key={segment.id} 
                className={`segment-card ${selectedSegment?.id === segment.id ? 'selected' : ''}`}
                onClick={() => setSelectedSegment(segment)}
              >
                <div className="segment-header">
                  <span className="district">{segment.district}</span>
                  <span className="score-badge">{Math.round(segment.score)}/100</span>
                </div>
                <div className="segment-area">{segment.area}</div>
                <div className="segment-type">{segment.propertyType} • {segment.sizeSegment}</div>
                
                <div className="segment-metrics">
                  <div className="metric">
                    <span className="metric-label">Price</span>
                    <span className="metric-value">{formatHKD(segment.priceBandLow)} - {formatHKD(segment.priceBandHigh)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Rent</span>
                    <span className="metric-value">{formatHKD(segment.rentBandLow)} - {formatHKD(segment.rentBandHigh)}/mo</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Yield</span>
                    <span className="metric-value">{(segment.yieldLow * 100).toFixed(1)}% - {(segment.yieldHigh * 100).toFixed(1)}%</span>
                  </div>
                </div>
                
                <div className="segment-risk">
                  <span className={`risk-badge ${segment.volatilityScore < 0.25 ? 'low' : segment.volatilityScore < 0.35 ? 'med' : 'high'}`}>
                    {segment.volatilityScore < 0.25 ? 'Low' : segment.volatilityScore < 0.35 ? 'Medium' : 'High'} Risk
                  </span>
                  <span className="liquidity">Liquidity: {Math.round(segment.liquidityScore * 100)}%</span>
                </div>
                
                {segment.score >= 70 && (
                  <div className="match-reason">
                    ✓ Matches your {prefs.primaryGoal}-focused goal
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedSegment && (
            <div className="selected-details">
              <h3><Building2 size={18} /> {selectedSegment.district} - {selectedSegment.area}</h3>
              <p className="compliance-note">
                <Info size={14} /> These are AI-generated market opportunity candidates based on external market data and your provided assumptions. They are not specific property listings or financial advice.
              </p>
              
              <button className="primary-button" onClick={() => { setActiveTab('simulator'); setSimPrice((selectedSegment.priceBandLow + selectedSegment.priceBandHigh) / 2) }}>
                <Calculator size={16} /> Simulate with my budget
              </button>
              
              {/* Website links for this district */}
              {districtWebsites[selectedSegment.district] && (
                <div className="district-websites">
                  <h4>Browse {selectedSegment.district} Properties</h4>
                  <div className="website-links">
                    {districtWebsites[selectedSegment.district].map((site) => (
                      <a 
                        key={site.name}
                        href={site.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="website-link"
                      >
                        {site.name} ↗
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'simulator' && (
        <div className="re-content">
          <div className="simulator-grid">
            <div className="sim-inputs">
              <h3>Purchase Details</h3>
              
              <div className="input-group">
                <label>Property Price</label>
                <input type="number" value={simPrice} onChange={(e) => setSimPrice(Number(e.target.value))} />
                <span className="input-hint">HKD</span>
              </div>
              
              <div className="input-group">
                <label>Down Payment</label>
                <input type="number" value={simDownPayment} onChange={(e) => setSimDownPayment(Number(e.target.value))} />
                <span className="input-hint">HKD</span>
              </div>
              
              <div className="input-group">
                <label>Mortgage Mode</label>
                <select value={prefs.mortgageMode} onChange={(e) => setPrefs({ ...prefs, mortgageMode: e.target.value as 'amortizing' | 'interest_only' })}>
                  <option value="amortizing">Amortizing (Principal + Interest)</option>
                  <option value="interest_only">Interest-Only</option>
                </select>
              </div>
              
              {prefs.mortgageMode === 'interest_only' && (
                <div className="input-group">
                  <label>Interest-Only Period</label>
                  <select value={prefs.interestOnlyYears} onChange={(e) => setPrefs({ ...prefs, interestOnlyYears: Number(e.target.value) })}>
                    <option value={1}>1 year</option>
                    <option value={2}>2 years</option>
                    <option value={3}>3 years</option>
                    <option value={5}>5 years</option>
                  </select>
                </div>
              )}
              
              <div className="input-group">
                <label>Interest Rate</label>
                <input type="number" step="0.1" value={prefs.interestRate} onChange={(e) => setPrefs({ ...prefs, interestRate: Number(e.target.value) })} />
                <span className="input-hint">% per year</span>
              </div>
            </div>
            
            <div className="sim-results">
              <h3>Simulation Results</h3>
              
              <div className="result-card">
                <div className="result-row">
                  <span>Loan Amount</span>
                  <span className="result-value">{formatHKD(simulation.loanAmount)}</span>
                </div>
                <div className="result-row">
                  <span>Monthly Payment</span>
                  <span className="result-value highlight">{formatHKD(simulation.monthlyPayment)}</span>
                </div>
                {prefs.mortgageMode === 'interest_only' && (
                  <div className="result-row">
                    <span>Principal After IO Period</span>
                    <span className="result-value warning">{formatHKD(simulation.principalAfterIO)}</span>
                  </div>
                )}
                <div className="result-row">
                  <span>Est. Effective Rent</span>
                  <span className="result-value">{formatHKD(simulation.effectiveRent)}</span>
                </div>
                <div className="result-row">
                  <span>Net Cashflow</span>
                  <span className={`result-value ${simulation.cashflow >= 0 ? 'positive' : 'negative'}`}>
                    {simulation.cashflow >= 0 ? '+' : ''}{formatHKD(simulation.cashflow)}
                  </span>
                </div>
                <div className="result-row">
                  <span>Cashflow Coverage</span>
                  <span className={`result-value ${simulation.coverageRatio >= 1 ? 'positive' : 'negative'}`}>
                    {simulation.coverageRatio.toFixed(2)}x
                  </span>
                </div>
              </div>
              
              {prefs.mortgageMode === 'interest_only' && (
                <div className="warning-box">
                  <AlertTriangle size={16} />
                  <p>Interest-only financing does not reduce principal during the interest-only period. You may need to refinance, sell the property, or make a lump-sum repayment to clear the debt.</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Stress Tests */}
          <div className="stress-tests">
            <h3><AlertTriangle size={18} /> Stress Tests</h3>
            <div className="stress-grid">
              {stressTests.map((test, i) => (
                <div key={i} className="stress-card">
                  <span className="stress-name">{test.name}</span>
                  <span className={`stress-impact ${test.impact === 'payment' ? 'negative' : test.newCashflow < 0 ? 'negative' : 'positive'}`}>
                    {test.impact === 'payment' 
                      ? `+${formatHKD(test.newPayment - simulation.monthlyPayment)}/mo`
                      : `${test.newCashflow >= 0 ? '+' : ''}${formatHKD(test.newCashflow)}`
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="re-content">
          <div className="preferences-form">
            <h3>Investment Preferences</h3>
            
            <div className="input-group">
              <label>Primary Real Estate Goal</label>
              <select value={prefs.primaryGoal} onChange={(e) => setPrefs({ ...prefs, primaryGoal: e.target.value as any })}>
                <option value="rent">Rent / Income</option>
                <option value="growth">Capital Growth</option>
                <option value="balanced">Balanced</option>
                <option value="diversification">Diversification</option>
                <option value="debt_reduction">Debt Reduction</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Risk Tolerance</label>
              <select value={prefs.riskTolerance} onChange={(e) => setPrefs({ ...prefs, riskTolerance: e.target.value as any })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <h3>Financial Capacity</h3>
            
            <div className="input-group">
              <label>Available Down Payment</label>
              <input type="number" value={prefs.downPayment} onChange={(e) => setPrefs({ ...prefs, downPayment: Number(e.target.value) })} />
              <span className="input-hint">HKD</span>
            </div>
            
            <div className="input-group">
              <label>Maximum Monthly Debt Payment</label>
              <input type="number" value={prefs.maxMonthlyDebt} onChange={(e) => setPrefs({ ...prefs, maxMonthlyDebt: Number(e.target.value) })} />
              <span className="input-hint">HKD</span>
            </div>
            
            <div className="input-group">
              <label>Monthly Income</label>
              <input type="number" value={prefs.monthlyIncome} onChange={(e) => setPrefs({ ...prefs, monthlyIncome: Number(e.target.value) })} />
              <span className="input-hint">HKD</span>
            </div>
            
            <div className="input-group">
              <label>Current Monthly Debt</label>
              <input type="number" value={prefs.currentMonthlyDebt} onChange={(e) => setPrefs({ ...prefs, currentMonthlyDebt: Number(e.target.value) })} />
              <span className="input-hint">HKD</span>
            </div>
            
            <h3>Rent Assumptions</h3>
            
            <div className="input-group">
              <label>Vacancy Rate</label>
              <select value={prefs.vacancyRate} onChange={(e) => setPrefs({ ...prefs, vacancyRate: Number(e.target.value) })}>
                <option value={0.03}>3%</option>
                <option value={0.05}>5%</option>
                <option value={0.08}>8%</option>
                <option value={0.10}>10%</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Rent Collection Risk</label>
              <select value={prefs.rentCollectionRisk} onChange={(e) => setPrefs({ ...prefs, rentCollectionRisk: e.target.value as any })}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div className="input-group">
              <label>Safety Buffer</label>
              <select value={prefs.safetyBufferMonths} onChange={(e) => setPrefs({ ...prefs, safetyBufferMonths: Number(e.target.value) })}>
                <option value={3}>3 months</option>
                <option value={6}>6 months</option>
                <option value={12}>12 months</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
