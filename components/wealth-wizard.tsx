'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BrainCircuit,
  Check,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
  X,
  MessageCircle,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Trash2,
  PieChart,
  CreditCard,
  Receipt,
} from 'lucide-react'

type Language = 'en' | 'yue' | 'zh'
type Currency = 'USD' | 'HKD' | 'CNY'

type ConsentFlags = {
  local_only: boolean
  upload_redacted: boolean
  upload_encrypted: boolean
  allow_retention: boolean
}

type DebtItem = {
  id: string
  category: string
  balance: number | null
  interestRate: number | null
  minPayment: number | null
}

type RealEstateAsset = {
  id: string
  propertyName: string
  district: string
  propertyType: 'residential' | 'commercial' | 'industrial' | 'parking' | 'other'
  purchasePrice: number | null
  currentValue: number | null
  mortgageBalance: number | null
  monthlyRent: number | null
  isRented: boolean
  monthlyExpenses: number | null // management fee, rates, maintenance
}

type Goal = {
  id: string
  name: string
  timeline: number
  priority: number
}

type UserData = {
  age: number | null
  monthlyIncome: number | null
  monthlyRentalIncome: number | null
  monthlyEssentialExpenses: number | null
  monthlyDiscretionary: number | null
  totalSavings: number | null
  debts: DebtItem[]
  realEstateAssets: RealEstateAsset[]
  employmentStability: 'stable' | 'variable' | null
  riskScore: number
  goals: Goal[]
}

type WizardStep = 'init' | 'intake' | 'health' | 'goals' | 'action' | 'xray'

// Currency conversion rates (approximate, for display only)
const currencySymbols: Record<Currency, string> = {
  USD: '$',
  HKD: 'HK$',
  CNY: '¥',
}

const currencyNames: Record<Currency, string> = {
  USD: 'USD - US Dollar',
  HKD: 'HKD - Hong Kong Dollar',
  CNY: 'CNY - Chinese Yuan',
}

const currencyRates: Record<Currency, number> = {
  USD: 1,
  HKD: 7.8,
  CNY: 7.25,
}

const debtCategories = [
  'Credit Card',
  'Mortgage',
  'Student Loan',
  'Car Loan',
  'Personal Loan',
  'Medical Debt',
  'Business Loan',
  'Other',
]

const debtCategoriesYue: Record<string, string> = {
  'Credit Card': '信用卡',
  'Mortgage': '按揭',
  'Student Loan': '學生貸款',
  'Car Loan': '車貸',
  'Personal Loan': '私人貸款',
  'Medical Debt': '醫療債務',
  'Business Loan': '生意貸款',
  'Other': '其他',
}

const debtCategoriesZh: Record<string, string> = {
  'Credit Card': '信用卡',
  'Mortgage': '按揭',
  'Student Loan': '学生贷款',
  'Car Loan': '车贷',
  'Personal Loan': '私人贷款',
  'Medical Debt': '医疗债务',
  'Business Loan': '商业贷款',
  'Other': '其他',
}

// ============ UI COPY ============
const uiCopy = {
  en: {
    welcome: 'Welcome to AI Pocket Advisor',
    subtitle: 'Your journey to financial clarity starts here',
    next: 'Continue',
    back: 'Back',
    skip: 'Skip for now',
    finish: 'Complete Setup',
    step: 'Step',
    of: 'of',
    // Init step
    languageSelect: 'Select your preferred language',
    currencySelect: 'Select your currency',
    consentTitle: 'How we handle your data',
    consentDesc: 'We believe in transparency. Choose what you\'re comfortable with:',
    consentLocal: 'Keep everything on my device',
    consentRedacted: 'Upload anonymized data for better insights',
    consentEncrypted: 'Upload encrypted data for analysis',
    consentRetention: 'Allow retention for ongoing advice',
    // Intake step
    intakeTitle: 'Let\'s get to know you',
    intakeDesc: 'This helps us build a personalized plan. You can skip any question.',
    qAge: 'What\'s your age?',
    qIncome: 'What\'s your monthly net income?',
    qRentalIncome: 'Monthly rental income (if any)?',
    qEssential: 'Monthly essential expenses (rent, utilities, food)?',
    qDiscretionary: 'Monthly discretionary spending (entertainment, dining out)?',
    qSavings: 'Total savings you have',
    qDebt: 'Add debt',
    qDebtCategory: 'Debt category',
    qDebtBalance: 'Balance',
    qDebtRate: 'Interest rate (%)',
    qDebtPayment: 'Minimum monthly payment',
    addDebt: 'Add another debt',
    removeDebt: 'Remove',
    // Real Estate translations
    qRealEstate: 'Real Estate Assets',
    addRealEstate: 'Add property',
    removeRealEstate: 'Remove',
    qPropertyName: 'Property name',
    qDistrict: 'District/Location',
    qPropertyType: 'Property type',
    qPurchasePrice: 'Purchase price',
    qCurrentValue: 'Current value',
    qMortgageBalance: 'Mortgage balance',
    qMonthlyRent: 'Monthly rent',
    qMonthlyExpenses: 'Monthly expenses (fees, maintenance)',
    qIsRented: 'Currently rented out?',
    propertyTypeResidential: 'Residential',
    propertyTypeCommercial: 'Commercial',
    propertyTypeIndustrial: 'Industrial',
    propertyTypeParking: 'Parking',
    propertyTypeOther: 'Other',
    qEmployment: 'How stable is your employment?',
    employmentStable: 'Very stable',
    employmentVariable: 'Somewhat variable',
    qRisk: 'If your portfolio dropped 20% tomorrow, what would you do?',
    riskSell: 'Sell everything',
    riskHold: 'Hold and wait',
    riskBuy: 'Buy more',
    // Health step
    healthTitle: 'Your Financial Health',
    healthDesc: 'Here\'s what the numbers tell us.',
    savingsRate: 'Savings Rate',
    savingsRateDesc: 'Percentage of income you save',
    dti: 'Debt-to-Income',
    dtiDesc: 'Ratio of debt payments to income',
    emergencyFund: 'Emergency Fund',
    emergencyFundDesc: 'Months of expenses covered by savings',
    netWorth: 'Net Worth',
    netWorthDesc: 'Total assets minus liabilities',
    months: 'months',
    statusGood: 'Good',
    statusWatch: 'Watch',
    statusUrgent: 'Urgent',
    topLeaks: 'Top Wealth Leaks',
    // Goals step
    goalsTitle: 'Prioritize Your Goals',
    goalsDesc: 'Rank your top 3 goals in order of importance to you.',
    goalWealth: 'Build long-term wealth',
    goalHome: 'Buy a home',
    goalRetire: 'Retire early',
    goalEducation: 'Fund education',
    goalEmergency: 'Build emergency fund',
    goalDebt: 'Pay off debt',
    timelineYears: 'years',
    // Action step
    actionTitle: 'Your Action Plan',
    actionDesc: 'Here\'s what to focus on next.',
    immediate: 'Immediate',
    shortTerm: 'Short-term',
    longTerm: 'Long-term',
    monthlyBenefit: '/month',
    yearlyBenefit: '/year',
    // Chat
    assistant: 'Wealth Assistant',
    askQuestion: 'Ask me anything about your finances...',
    // Recommendations tabs
    portfolio: 'Portfolio',
    debtPayoff: 'Debt Payoff',
    taxOpt: 'Tax',
    // Portfolio
    portfolioTitle: 'Recommended Portfolio',
    portfolioDesc: 'Based on your risk profile and goals',
    portfolioStrategy: 'Strategy',
    portfolioAggressive: 'Aggressive Growth',
    portfolioModerate: 'Moderate Balanced',
    portfolioConservative: 'Conservative Income',
    portfolioAllocation: 'Asset Allocation',
    portfolioStocks: 'Stocks',
    portfolioBonds: 'Bonds',
    portfolioCash: 'Cash',
    portfolioOther: 'Other',
    portfolioExpectedReturn: 'Expected Return',
    portfolioRiskLevel: 'Risk Level',
    portfolioLow: 'Low',
    portfolioMedium: 'Medium',
    portfolioHigh: 'High',
    portfolioNote: 'Note: This is educational allocation guidance, not personalized investment advice.',
    // Debt Payoff
    debtPayoffTitle: 'Debt Payoff Strategy',
    debtPayoffDesc: 'Optimize your debt repayment plan',
    debtTotal: 'Total Debt',
    debtAvgRate: 'Average Interest Rate',
    debtMinPayment: 'Total Min. Payment',
    debtPayoffMethod: 'Payoff Method',
    debtAvalanche: 'Avalanche (Highest rate first)',
    debtSnowball: 'Snowball (Smallest balance first)',
    debtPayoffMonths: 'Months to debt-free',
    debtInterestSaved: 'Interest Saved vs. Minimum',
    debtPriorityOrder: 'Payoff Priority',
    debtPayoffExtra: 'Extra monthly payment',
    debtApplyExtra: 'Apply extra to',
    // Tax Optimization
    taxOptTitle: 'Tax Optimization',
    taxOptDesc: 'Ways to reduce your tax burden',
    taxFilingStatus: 'Filing Status',
    taxSingle: 'Single',
    taxMarried: 'Married Filing Jointly',
    taxMarriedSep: 'Married Filing Separately',
    taxHead: 'Head of Household',
    taxEstimatedTax: 'Estimated Tax Liability',
    taxEffectiveRate: 'Effective Rate',
    taxMarginalRate: 'Marginal Rate',
    taxDeductions: 'Potential Deductions',
    taxStandard: 'Standard Deduction',
    taxItemized: 'Itemized Deductions',
    tax401k: '401(k) / Retirement',
    taxIRA: 'IRA Contribution',
    taxHSA: 'HSA Contribution',
    taxTaxTips: 'Tax-Saving Tips',
    // Results
    monthsToPayoff: 'months to payoff',
    interestSaved: 'interest saved',
    // X-Ray Results
    xrayTitle: 'Your Financial X-Ray',
    xrayDesc: 'Instant snapshot of where you stand',
    healthScore: 'Financial Health Score',
    netWorth: 'Net Worth',
    safeToSpend: 'Safe to Spend',
    topProblems: 'Top Money Issues',
    whyMatters: 'Why this matters',
    getActionPlan: 'Get my 3-month action plan',
    tellMeMore: 'Tell me more',
    scoreExcellent: 'Excellent',
    scoreGood: 'Good',
    scoreFair: 'Fair',
    scoreNeedsWork: 'Needs Work',
    problemSavings: 'Low emergency savings',
    problemDebt: 'High-interest debt',
    problemSpending: 'High discretionary spending',
    problemIncome: 'Income too low for goals',
    problemDTI: 'Debt-to-income too high',
    problemSavingsDesc: 'You need 3-6 months of expenses saved for emergencies',
    problemDebtDesc: 'High-interest debt erodes your wealth faster than it grows',
    problemSpendingDesc: 'Reducing discretionary spending accelerates wealth building',
    problemIncomeDesc: 'Consider ways to increase income or adjust goals',
    problemDTIDesc: 'High DTI limits your ability to borrow and save',
  },
  yue: {
    welcome: '歡迎使用 AI Pocket Advisor',
    subtitle: '你嘅財務清晰之旅由呢度開始',
    next: '繼續',
    back: '返回',
    skip: '暫時跳過',
    finish: '完成設定',
    step: '步驟',
    of: '共',
    languageSelect: '選擇你喜歡嘅語言',
    currencySelect: '選擇你嘅貨幣',
    consentTitle: '我哋點樣處理你嘅數據',
    consentDesc: '我哋相信透明度。選擇你放心嘅選項：',
    consentLocal: '所有嘢keep喺我部機',
    consentRedacted: '上傳匿名數據以獲得更好建議',
    consentEncrypted: '上傳加密數據进行分析',
    consentRetention: '允許保留數據以獲得持續建議',
    intakeTitle: '等我哋認識吓你',
    intakeDesc: '呢啲幫到我哋為你制定個性化計劃。你可以跳過任何問題。',
    qAge: '你幾多歲？',
    qIncome: '你每月淨收入係幾多？',
    qRentalIncome: '每月租金收入（如果有）？',
    qEssential: '每月必要開支（租金、水電、食物）？',
    qDiscretionary: '每月彈性開支（娛樂、出去食）？',
    qSavings: '你總共有幾多儲蓄？',
    qDebt: '添加債務',
    qDebtCategory: '債務類型',
    qDebtBalance: '欠款金額',
    qDebtRate: '利率（%）',
    qDebtPayment: '每月最低還款額',
    addDebt: '添加另一筆債務',
    removeDebt: '刪除',
    // Real Estate translations
    qRealEstate: '樓盤資產',
    addRealEstate: '添加樓盤',
    removeRealEstate: '刪除',
    qPropertyName: '樓盤名稱',
    qDistrict: '地區/位置',
    qPropertyType: '樓盤類型',
    qPurchasePrice: '購買價格',
    qCurrentValue: '現時價值',
    qMortgageBalance: '按揭餘額',
    qMonthlyRent: '每月租金',
    qMonthlyExpenses: '每月開支（管理費、維修）',
    qIsRented: '目前有出租嗎？',
    propertyTypeResidential: '住宅',
    propertyTypeCommercial: '商舖',
    propertyTypeIndustrial: '工業',
    propertyTypeParking: '車位',
    propertyTypeOther: '其他',
    qEmployment: '你份工有幾穩定？',
    employmentStable: '非常穩定',
    employmentVariable: '比較唔穩定',
    qRisk: '如果你嘅投資組合聽日跌20%，你會點做？',
    riskSell: '全部賣咗佢',
    riskHold: '持有等運到',
    riskBuy: '買多啲',
    healthTitle: '你嘅財務健康',
    healthDesc: '數字話比我哋聽.',
    savingsRate: '儲蓄率',
    savingsRateDesc: '你收入中儲蓄嘅百分比',
    dti: '負債收入比',
    dtiDesc: '債務還款同收入嘅比例',
    emergencyFund: '應急基金',
    emergencyFundDesc: '儲蓄可以覆蓋幾個月開支',
    netWorth: '淨資產',
    netWorthDesc: '總資產減總負債',
    months: '個月',
    statusGood: '良好',
    statusWatch: '注意',
    statusUrgent: '緊急',
    topLeaks: '主要財富流失',
    goalsTitle: '排列你嘅目標',
    goalsDesc: '將你前3個最重要嘅目標排序。',
    goalWealth: '建立長期財富',
    goalHome: '買樓',
    goalRetire: '提早退休',
    goalEducation: '資助教育',
    goalEmergency: '建立應急基金',
    goalDebt: '還清債務',
    timelineYears: '年',
    actionTitle: '你嘅行動計劃',
    actionDesc: '呢啲係你下一步要專注嘅嘢。',
    immediate: '立即',
    shortTerm: '短期',
    longTerm: '長期',
    monthlyBenefit: '/月',
    yearlyBenefit: '/年',
    assistant: '財富助手',
    askQuestion: '問我任何關於你財務嘅問題...',
    portfolio: '投資組合',
    debtPayoff: '還款策略',
    taxOpt: '稅務',
    portfolioTitle: '推薦投資組合',
    portfolioDesc: '根據你嘅風險偏好同目標',
    portfolioStrategy: '策略',
    portfolioAggressive: '進取增長',
    portfolioModerate: '均衡配置',
    portfolioConservative: '保守收益',
    portfolioAllocation: '資產配置',
    portfolioStocks: '股票',
    portfolioBonds: '債券',
    portfolioCash: '現金',
    portfolioOther: '其他',
    portfolioExpectedReturn: '預期回報',
    portfolioRiskLevel: '風險水平',
    portfolioLow: '低',
    portfolioMedium: '中',
    portfolioHigh: '高',
    portfolioNote: '注意：呢個係教育性質嘅配置建議，唔係個人化投資建議。',
    debtPayoffTitle: '債務還款策略',
    debtPayoffDesc: '優化你嘅還款計劃',
    debtTotal: '總債務',
    debtAvgRate: '平均利率',
    debtMinPayment: '每月最低還款',
    debtPayoffMethod: '還款方法',
    debtAvalanche: '雪崩式（高息先還）',
    debtSnowball: '雪球式（細數先還）',
    debtPayoffMonths: '幾時還完',
    debtInterestSaved: '節省利息',
    debtPriorityOrder: '還款優先次序',
    debtPayoffExtra: '額外月還款',
    debtApplyExtra: '用於',
    taxOptTitle: '稅務優化',
    taxOptDesc: '降低稅務負擔嘅方法',
    taxFilingStatus: '報稅身份',
    taxSingle: '單身',
    taxMarried: '已婚合併申報',
    taxMarriedSep: '已婚分開申報',
    taxHead: '戶主',
    taxEstimatedTax: '預計稅款',
    taxEffectiveRate: '實際稅率',
    taxMarginalRate: '邊際稅率',
    taxDeductions: '可扣稅項目',
    taxStandard: '標準扣除額',
    taxItemized: '逐項扣除',
    tax401k: '401(k) / 退休',
    taxIRA: 'IRA供款',
    taxHSA: 'HSA供款',
    taxTaxTips: '慳稅貼士',
    monthsToPayoff: '個月還完',
    interestSaved: '慳利息',
    // X-Ray Results
    xrayTitle: '你的財務 X-Ray',
    xrayDesc: '即時了解你嘅財務狀況',
    healthScore: '財務健康分數',
    netWorth: '淨資產',
    safeToSpend: '可花費金額',
    topProblems: '主要金錢問題',
    whyMatters: '點解咁重要',
    getActionPlan: '獲取我嘅3個月行動計劃',
    tellMeMore: '了解更多',
    scoreExcellent: '非常好',
    scoreGood: '好',
    scoreFair: '一般',
    scoreNeedsWork: '需要改善',
    problemSavings: '應急儲蓄不足',
    problemDebt: '高息債務',
    problemSpending: '彈性支出過高',
    problemIncome: '收入未能達成目標',
    problemDTI: '債務收入比過高',
    problemSavingsDesc: '你需要儲蓄3-6個月支出作為應急基金',
    problemDebtDesc: '高息債務會蠶食你嘅財富',
    problemSpendingDesc: '減少彈性支出可以加速財富累積',
    problemIncomeDesc: '考慮增加收入或調整目標',
    problemDTIDesc: '高債務收入比會限制你借貸同儲蓄',
  },
  zh: {
    welcome: '欢迎使用 AI Pocket Advisor',
    subtitle: '您的财务清晰之旅从这里开始',
    next: '继续',
    back: '返回',
    skip: '暂时跳过',
    finish: '完成设置',
    step: '步骤',
    of: '共',
    languageSelect: '选择您偏好的语言',
    currencySelect: '选择您的货币',
    consentTitle: '我们如何处理您的数据',
    consentDesc: '我们相信透明度。选择您放心的选项：',
    consentLocal: '所有数据保留在设备上',
    consentRedacted: '上传匿名数据以获得更好建议',
    consentEncrypted: '上传加密数据进行分析',
    consentRetention: '允许保留数据以获得持续建议',
    intakeTitle: '让我们了解您',
    intakeDesc: '这有助于我们制定个性化计划。您可以跳过任何问题。',
    qAge: '您今年多大？',
    qIncome: '您每月净收入是多少？',
    qRentalIncome: '每月租金收入（如果有）？',
    qEssential: '每月必要开支（租金、水电、食物）？',
    qDiscretionary: '每月弹性开支（娱乐、外出就餐）？',
    qSavings: '您总共有多少储蓄？',
    qDebt: '添加债务',
    qDebtCategory: '债务类型',
    qDebtBalance: '欠款金额',
    qDebtRate: '利率（%）',
    qDebtPayment: '每月最低还款额',
    addDebt: '添加另一笔债务',
    removeDebt: '删除',
    // Real Estate translations
    qRealEstate: '房产资产',
    addRealEstate: '添加房产',
    removeRealEstate: '删除',
    qPropertyName: '房产名称',
    qDistrict: '地区/位置',
    qPropertyType: '房产类型',
    qPurchasePrice: '购买价格',
    qCurrentValue: '当前价值',
    qMortgageBalance: '按揭余额',
    qMonthlyRent: '每月租金',
    qMonthlyExpenses: '每月开支（管理费、维修）',
    qIsRented: '目前有出租吗？',
    propertyTypeResidential: '住宅',
    propertyTypeCommercial: '商业',
    propertyTypeIndustrial: '工业',
    propertyTypeParking: '车位',
    propertyTypeOther: '其他',
    qEmployment: '您的就业有多稳定？',
    employmentStable: '非常稳定',
    employmentVariable: '不太稳定',
    qRisk: '如果您的投资组合明天下跌20%，您会怎么做？',
    riskSell: '全部卖出',
    riskHold: '持有等待',
    riskBuy: '买入更多',
    healthTitle: '您的财务健康',
    healthDesc: '数字告诉我们的情况。',
    savingsRate: '储蓄率',
    savingsRateDesc: '您收入中储蓄的百分比',
    dti: '负债收入比',
    dtiDesc: '债务还款与收入的比例',
    emergencyFund: '应急基金',
    emergencyFundDesc: '储蓄可以覆盖多少个月的开支',
    netWorth: '净资产',
    netWorthDesc: '总资产减总负债',
    months: '个月',
    statusGood: '良好',
    statusWatch: '注意',
    statusUrgent: '紧急',
    topLeaks: '主要财富流失',
    goalsTitle: '排列您的目标',
    goalsDesc: '将您前3个最重要的目标排序。',
    goalWealth: '建立长期财富',
    goalHome: '买房',
    goalRetire: '提早退休',
    goalEducation: '资助教育',
    goalEmergency: '建立应急基金',
    goalDebt: '还清债务',
    timelineYears: '年',
    actionTitle: '您的行动计划',
    actionDesc: '这些是您下一步要专注的。',
    immediate: '立即',
    shortTerm: '短期',
    longTerm: '长期',
    monthlyBenefit: '/月',
    yearlyBenefit: '/年',
    assistant: '财富助手',
    askQuestion: '问我任何关于您财务的问题...',
    portfolio: '投资组合',
    debtPayoff: '还款策略',
    taxOpt: '税务',
    portfolioTitle: '推荐投资组合',
    portfolioDesc: '根据您的风险偏好和目标',
    portfolioStrategy: '策略',
    portfolioAggressive: '进取增长',
    portfolioModerate: '均衡配置',
    portfolioConservative: '保守收益',
    portfolioAllocation: '资产配置',
    portfolioStocks: '股票',
    portfolioBonds: '债券',
    portfolioCash: '现金',
    portfolioOther: '其他',
    portfolioExpectedReturn: '预期回报',
    portfolioRiskLevel: '风险水平',
    portfolioLow: '低',
    portfolioMedium: '中',
    portfolioHigh: '高',
    portfolioNote: '注意：这是教育性质的投资配置建议，非个性化投资建议。',
    debtPayoffTitle: '债务还款策略',
    debtPayoffDesc: '优化您的还款计划',
    debtTotal: '总债务',
    debtAvgRate: '平均利率',
    debtMinPayment: '每月最低还款',
    debtPayoffMethod: '还款方法',
    debtAvalanche: '雪崩式（高息先还）',
    debtSnowball: '雪球式（小额先还）',
    debtPayoffMonths: '何时还完',
    debtInterestSaved: '节省利息',
    debtPriorityOrder: '还款优先次序',
    debtPayoffExtra: '额外月还款',
    debtApplyExtra: '用于',
    taxOptTitle: '税务优化',
    taxOptDesc: '降低税务负担的方法',
    taxFilingStatus: '报税身份',
    taxSingle: '单身',
    taxMarried: '已婚合并申报',
    taxMarriedSep: '已婚分开申报',
    taxHead: '户主',
    taxEstimatedTax: '预计税款',
    taxEffectiveRate: '实际税率',
    taxMarginalRate: '边际税率',
    taxDeductions: '可扣税项目',
    taxStandard: '标准扣除额',
    taxItemized: '逐项扣除',
    tax401k: '401(k) / 退休',
    taxIRA: 'IRA供款',
    taxHSA: 'HSA供款',
    taxTaxTips: '省税贴士',
    monthsToPayoff: '个月还完',
    interestSaved: '省利息',
    // X-Ray Results
    xrayTitle: '您的财务 X 光检查',
    xrayDesc: '即时了解您的财务状况',
    healthScore: '财务健康分数',
    netWorth: '净资产',
    safeToSpend: '可支出金额',
    topProblems: '主要金钱问题',
    whyMatters: '为什么重要',
    getActionPlan: '获取我的3个月行动计划',
    tellMeMore: '了解更多',
    scoreExcellent: '非常好',
    scoreGood: '良好',
    scoreFair: '一般',
    scoreNeedsWork: '需要改善',
    problemSavings: '应急储蓄不足',
    problemDebt: '高息债务',
    problemSpending: '弹性支出过高',
    problemIncome: '收入无法达成目标',
    problemDTI: '债务收入比过高',
    problemSavingsDesc: '您需要储蓄3-6个月支出作为应急基金',
    problemDebtDesc: '高息债务会侵蚀您的财富',
    problemSpendingDesc: '减少弹性支出可以加速财富累积',
    problemIncomeDesc: '考虑增加收入或调整目标',
    problemDTIDesc: '高债务收入比会限制您借贷和储蓄的能力',
  },
} as const

// ============ COMPONENT ============
export function WealthWizard({ 
  onComplete, 
  onClose,
  initialLanguage = 'en' 
}: { 
  onComplete?: (data: UserData) => void
  onClose?: () => void
  initialLanguage?: Language
}) {
  const [language, setLanguage] = useState<Language>(initialLanguage)
  const [currency, setCurrency] = useState<Currency>('USD')
  const [currentStep, setCurrentStep] = useState<WizardStep>('init')
  const [consent, setConsent] = useState<ConsentFlags>({
    local_only: true,
    upload_redacted: false,
    upload_encrypted: false,
    allow_retention: false,
  })
  const [userData, setUserData] = useState<UserData>({
    age: null,
    monthlyIncome: null,
      monthlyRentalIncome: null,
      monthlyEssentialExpenses: null,
    monthlyDiscretionary: null,
    totalSavings: null,
    debts: [],
    realEstateAssets: [],
    employmentStability: null,
    riskScore: 5,
    goals: [],
  })
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  
  // Recommendations state
  const [activeTab, setActiveTab] = useState<'portfolio' | 'debt' | 'tax'>('portfolio')
  const [debtPayoffMethod, setDebtPayoffMethod] = useState<'avalanche' | 'snowball'>('avalanche')
  const [extraPayment, setExtraPayment] = useState<number>(0)
  const [filingStatus, setFilingStatus] = useState<'single' | 'married_joint' | 'married_separate' | 'head'>('single')

  const t = uiCopy[language]
  const stepOrder: WizardStep[] = ['init', 'intake', 'health', 'goals', 'action', 'xray']
  const stepIndex = stepOrder.indexOf(currentStep)
  const totalSteps = stepOrder.length

  // Helper functions
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '—'
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
    return `${currencySymbols[currency]}${formatted}`
  }

  // Format number with commas for display in inputs
  const formatInputValue = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return ''
    return new Intl.NumberFormat('en-US').format(value)
  }

  // Parse formatted number string back to number
  const parseInputValue = (value: string): number | null => {
    if (!value.trim()) return null
    const cleaned = value.replace(/,/g, '')
    const num = Number(cleaned)
    return isNaN(num) ? null : num
  }
  
  const getTotalDebt = (): number => {
    return userData.debts.reduce((sum, debt) => sum + (debt.balance || 0), 0)
  }
  
  const getWeightedInterestRate = (): number => {
    const total = getTotalDebt()
    if (total === 0) return 0
    return userData.debts.reduce((sum, debt) => {
      const weight = (debt.balance || 0) / total
      return sum + ((debt.interestRate || 0) * weight)
    }, 0)
  }
  
  const getTotalMinPayment = (): number => {
    return userData.debts.reduce((sum, debt) => sum + (debt.minPayment || 0), 0)
  }

  // Calculate total monthly income (salary + rental from survey + real estate rental)
  const getTotalMonthlyIncome = () => (userData.monthlyIncome || 0) + (userData.monthlyRentalIncome || 0) + getTotalRealEstateRentalIncome()

  // Calculate financial metrics
  const metrics = {
    savingsRate: getTotalMonthlyIncome() && userData.monthlyEssentialExpenses && userData.monthlyDiscretionary
      ? ((getTotalMonthlyIncome() - userData.monthlyEssentialExpenses - userData.monthlyDiscretionary) / getTotalMonthlyIncome() * 100)
      : null,
    dti: getTotalMonthlyIncome() && getTotalDebt() > 0
      ? ((getTotalMinPayment() / getTotalMonthlyIncome()) * 100)
      : null,
    emergencyFundMonths: userData.monthlyEssentialExpenses && userData.totalSavings
      ? userData.totalSavings / userData.monthlyEssentialExpenses
      : null,
    netWorth: (userData.totalSavings || 0) + getTotalRealEstateValue() - getTotalDebt() - getTotalRealEstateMortgage(),
    totalDebt: getTotalDebt(),
  }

  // X-Ray calculations
  const healthScore = Math.round(
    (metrics.savingsRate ? Math.min(metrics.savingsRate / 20 * 25, 25) : 0) + // Savings rate (target 20%)
    (metrics.emergencyFundMonths ? Math.min(metrics.emergencyFundMonths / 6 * 25, 25) : 0) + // Emergency fund (target 6 months)
    (metrics.dti ? Math.max(25 - metrics.dti, 0) : 25) + // DTI (target <36%)
    (metrics.netWorth && metrics.netWorth > 0 ? 25 : 0) // Positive net worth
  )

  const healthScoreLevel = healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : healthScore >= 40 ? 'fair' : 'needs-work'

  const healthScoreLabel = 
    healthScoreLevel === 'excellent' ? t.scoreExcellent :
    healthScoreLevel === 'good' ? t.scoreGood :
    healthScoreLevel === 'fair' ? t.scoreFair : t.scoreNeedsWork

  // Safe to spend = income - essential - debt payments
  const safeToSpend = Math.max(0, 
    (userData.monthlyIncome || 0) - 
    (userData.monthlyEssentialExpenses || 0) - 
    getTotalMinPayment()
  )

  // Identify top problems
  type ProblemType = 'savings' | 'debt' | 'spending' | 'income' | 'dti'
  const topProblems: ProblemType[] = []

  if (metrics.emergencyFundMonths !== null && metrics.emergencyFundMonths < 3) {
    topProblems.push('savings')
  }
  if (getTotalDebt() > 0 && getWeightedInterestRate() > 10) {
    topProblems.push('debt')
  }
  if (metrics.savingsRate !== null && metrics.savingsRate < 10) {
    topProblems.push('spending')
  }
  if (metrics.dti !== null && metrics.dti > 36) {
    topProblems.push('dti')
  }

  const getProblemLabel = (problem: ProblemType): string => {
    switch (problem) {
      case 'savings': return t.problemSavings
      case 'debt': return t.problemDebt
      case 'spending': return t.problemSpending
      case 'income': return t.problemIncome
      case 'dti': return t.problemDTI
    }
  }

  const getProblemDescription = (problem: ProblemType): string => {
    switch (problem) {
      case 'savings': return t.problemSavingsDesc
      case 'debt': return t.problemDebtDesc
      case 'spending': return t.problemSpendingDesc
      case 'income': return t.problemIncomeDesc
      case 'dti': return t.problemDTIDesc
    }
  }

  // Get status color/class
  const getStatus = (value: number | null, good: number, urgent: number) => {
    if (value === null) return 'neutral'
    if (value >= good) return 'good'
    if (value >= urgent) return 'watch'
    return 'urgent'
  }

  // Generate action items based on data
  const actionItems = [
    { type: 'immediate', title: 'Build emergency fund', benefit: null, effort: 'Low', desc: metrics.emergencyFundMonths && metrics.emergencyFundMonths < 3 ? `Save ${formatCurrency((3 - metrics.emergencyFundMonths) * (userData.monthlyEssentialExpenses || 0))} more` : 'Maintain 3-6 months expenses' },
    { type: 'shortTerm', title: 'Reduce high-interest debt', benefit: metrics.totalDebt && getWeightedInterestRate() ? Math.round(metrics.totalDebt * getWeightedInterestRate() / 100 / 12) : null, effort: 'Medium', desc: 'Focus on credit card balances first' },
    { type: 'shortTerm', title: 'Optimize discretionary spending', benefit: userData.monthlyDiscretionary ? Math.round(userData.monthlyDiscretionary * 0.1) : null, effort: 'Low', desc: 'Small cuts add up over time' },
    { type: 'longTerm', title: 'Start automated investing', benefit: userData.monthlyIncome ? Math.round(userData.monthlyIncome * 0.1 * 7 / 100) : null, effort: 'Medium', desc: 'Set up recurring contributions' },
    { type: 'longTerm', title: 'Review tax-advantaged accounts', benefit: null, effort: 'Medium', desc: 'Maximize employer 401k match' },
  ]

  // ============ PORTFOLIO RECOMMENDATIONS ============
  const getPortfolioAllocation = () => {
    const risk = userData.riskScore || 5
    if (risk >= 8) {
      return { stocks: 90, bonds: 5, cash: 5, other: 0, strategy: 'portfolioAggressive' as const, expectedReturn: 10, risk: 'high' as const }
    } else if (risk >= 5) {
      return { stocks: 70, bonds: 25, cash: 5, other: 0, strategy: 'portfolioModerate' as const, expectedReturn: 7, risk: 'medium' as const }
    } else {
      return { stocks: 40, bonds: 50, cash: 10, other: 0, strategy: 'portfolioConservative' as const, expectedReturn: 4, risk: 'low' as const }
    }
  }

  // ============ DEBT PAYOFF CALCULATIONS ============
  const calculatePayoffPlan = () => {
    const debts = userData.debts.filter(d => d.balance && d.balance > 0 && d.interestRate)
    if (debts.length === 0) return null

    // Sort debts based on method
    const sortedDebts = [...debts].sort((a, b) => {
      if (debtPayoffMethod === 'avalanche') {
        return (b.interestRate || 0) - (a.interestRate || 0)
      } else {
        return (a.balance || 0) - (b.balance || 0)
      }
    })

    const totalDebt = getTotalDebt()
    const monthlyRate = getWeightedInterestRate() / 100 / 12
    const totalMinPayment = getTotalMinPayment()
    const extra = extraPayment || 0

    // Calculate months to payoff with extra payment
    let balance = totalDebt
    let months = 0
    let totalInterest = 0
    
    while (balance > 0 && months < 600) {
      const interest = balance * monthlyRate
      totalInterest += interest
      const payment = Math.min(totalMinPayment + extra, balance + interest)
      balance = balance + interest - payment
      months++
    }

    // Calculate interest with minimum payments only (for comparison)
    let minBalance = totalDebt
    let minMonths = 0
    let minInterest = 0
    while (minBalance > 0 && minMonths < 600) {
      const interest = minBalance * monthlyRate
      minInterest += interest
      const payment = Math.min(totalMinPayment, minBalance + interest)
      minBalance = minBalance + interest - payment
      minMonths++
    }

    return {
      months,
      totalInterest,
      interestSaved: minInterest - totalInterest,
      priority: sortedDebts.map(d => ({ category: d.category, balance: d.balance, rate: d.interestRate })),
    }
  }

  // ============ TAX CALCULATIONS ============
  const calculateTax = () => {
    const annualIncome = ((userData.monthlyIncome || 0) + (userData.monthlyRentalIncome || 0) + getTotalRealEstateRentalIncome()) * 12
    if (annualIncome === 0) return null

    // 2024 US Federal Tax Brackets (simplified)
    const brackets = filingStatus === 'single' || filingStatus === 'married_separate' 
      ? [
          { limit: 11600, rate: 0.10 },
          { limit: 47150, rate: 0.12 },
          { limit: 100525, rate: 0.22 },
          { limit: 191950, rate: 0.24 },
          { limit: 243725, rate: 0.32 },
          { limit: 609350, rate: 0.35 },
          { limit: Infinity, rate: 0.37 },
        ]
      : [
          { limit: 23200, rate: 0.10 },
          { limit: 94300, rate: 0.12 },
          { limit: 201050, rate: 0.22 },
          { limit: 383900, rate: 0.24 },
          { limit: 487450, rate: 0.32 },
          { limit: 731200, rate: 0.35 },
          { limit: Infinity, rate: 0.37 },
        ]

    // Calculate tax
    let tax = 0
    let remaining = annualIncome
    let prevLimit = 0
    
    for (const bracket of brackets) {
      const taxable = Math.min(Math.max(remaining, 0), bracket.limit - prevLimit)
      tax += taxable * bracket.rate
      remaining -= taxable
      prevLimit = bracket.limit
      if (remaining <= 0) break
    }

    // Standard deduction
    const standardDeduction = filingStatus === 'single' ? 14600 : filingStatus === 'married_joint' ? 29200 : filingStatus === 'married_separate' ? 14600 : 21900
    
    // Potential deductions
    const max401k = Math.min(annualIncome * 0.20, 23000)
    const maxIRA = 7000
    const maxHSA = 4150

    const effectiveRate = annualIncome > 0 ? (tax / annualIncome) * 100 : 0
    const marginalRate = brackets.find(b => annualIncome <= b.limit)?.rate || 0.37

    return {
      grossIncome: annualIncome,
      estimatedTax: tax,
      effectiveRate,
      marginalRate,
      standardDeduction,
      potentialDeductions: {
        max401k,
        maxIRA,
        maxHSA,
      },
    }
  }

  const portfolio = getPortfolioAllocation()
  const payoffPlan = calculatePayoffPlan()
  const taxInfo = calculateTax()

  // Chat functions
  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return
    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setChatLoading(true)
    
    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          language,
          profile: {
            age: userData.age || 0,
            salary: ((userData.monthlyIncome || 0) + (userData.monthlyRentalIncome || 0) + getTotalRealEstateRentalIncome()) * 12,
            otherIncome: 0,
            expenses: (userData.monthlyEssentialExpenses || 0) + (userData.monthlyDiscretionary || 0),
            debt: getTotalDebt(),
            emergencySavings: userData.totalSavings || 0,
            goal: userData.goals[0]?.name || 'Build wealth',
            timeline: userData.goals[0]?.timeline || 10,
            risk: userData.riskScore <= 3 ? 'conservative' : userData.riskScore <= 7 ? 'balanced' : 'growth',
            interests: [],
          },
          recommendation: null,
          market: null,
        }),
      })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.message || 'I\'m here to help with your financial journey.' }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: language === 'yue' ? '暫時無法回應，請稍後再試。' : language === 'zh' ? '暂时无法回应，请稍后再试。' : 'I\'m having trouble responding right now. Please try again.' }])
    } finally {
      setChatLoading(false)
    }
  }

  function nextStep() {
    const nextIndex = stepIndex + 1
    if (nextIndex < totalSteps) {
      setCurrentStep(stepOrder[nextIndex])
    } else {
      onComplete?.(userData)
    }
  }

  function prevStep() {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex])
    }
  }

  function updateData<K extends keyof UserData>(key: K, value: UserData[K]) {
    setUserData(prev => ({ ...prev, [key]: value }))
  }

  // Debt management functions
  function addDebt() {
    const newDebt: DebtItem = {
      id: Date.now().toString(),
      category: '',
      balance: null,
      interestRate: null,
      minPayment: null,
    }
    setUserData(prev => ({ ...prev, debts: [...prev.debts, newDebt] }))
  }

  function updateDebt(id: string, field: keyof DebtItem, value: string | number | null) {
    setUserData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, [field]: value } : d)
    }))
  }

  function removeDebt(id: string) {
    setUserData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }))
  }

  function getDebtCategoryLabel(category: string): string {
    if (language === 'yue') return debtCategoriesYue[category] || category
    if (language === 'zh') return debtCategoriesZh[category] || category
    return category
  }

  // Real Estate Asset management functions
  function addRealEstateAsset() {
    const newAsset: RealEstateAsset = {
      id: Date.now().toString(),
      propertyName: '',
      district: '',
      propertyType: 'residential',
      purchasePrice: null,
      currentValue: null,
      mortgageBalance: null,
      monthlyRent: null,
      isRented: false,
      monthlyExpenses: null,
    }
    setUserData(prev => ({ ...prev, realEstateAssets: [...prev.realEstateAssets, newAsset] }))
  }

  function updateRealEstateAsset(id: string, field: keyof RealEstateAsset, value: string | number | boolean | null) {
    setUserData(prev => ({
      ...prev,
      realEstateAssets: prev.realEstateAssets.map(a => a.id === id ? { ...a, [field]: value } : a)
    }))
  }

  function removeRealEstateAsset(id: string) {
    setUserData(prev => ({ ...prev, realEstateAssets: prev.realEstateAssets.filter(a => a.id !== id) }))
  }

  // Calculate total rental income from real estate
  function getTotalRealEstateRentalIncome(): number {
    return userData.realEstateAssets
      .filter(a => a.isRented && a.monthlyRent)
      .reduce((sum, a) => sum + (a.monthlyRent || 0), 0)
  }

  // Calculate total real estate value
  function getTotalRealEstateValue(): number {
    return userData.realEstateAssets
      .filter(a => a.currentValue)
      .reduce((sum, a) => sum + (a.currentValue || 0), 0)
  }

  // Calculate total mortgage on real estate
  function getTotalRealEstateMortgage(): number {
    return userData.realEstateAssets
      .filter(a => a.mortgageBalance)
      .reduce((sum, a) => sum + (a.mortgageBalance || 0), 0)
  }

  // ============ RENDER ============
  return (
    <div className="wizard-overlay">
      <div className="wizard-container">
        {/* Header */}
        <header className="wizard-header">
          <div className="wizard-brand">
            <img src="/aurum-ai-logo.svg" alt="AI Pocket Advisor" className="brand-mark" />
            <div>
              <div className="brand-name">Wealth Onboarding</div>
            </div>
          </div>
          <div className="wizard-progress">
            <span>{t.step} {stepIndex + 1} {t.of} {totalSteps}</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
            </div>
          </div>
          <button className="wizard-close" onClick={onClose}>
            <X size={20} />
          </button>
        </header>

        {/* Content */}
        <div className="wizard-content">
          {/* STEP 1: INIT */}
          {currentStep === 'init' && (
            <div className="wizard-step animate-in">
              <div className="wizard-hero">
                <Sparkles size={32} />
                <h1>{t.welcome}</h1>
                <p>{t.subtitle}</p>
              </div>

              <div className="wizard-section">
                <h3>{t.languageSelect}</h3>
                <div className="language-options">
                  {(['en', 'yue', 'zh'] as const).map((lang) => (
                    <button
                      key={lang}
                      className={`language-btn ${language === lang ? 'active' : ''}`}
                      onClick={() => setLanguage(lang)}
                    >
                      {lang === 'en' ? 'English' : lang === 'yue' ? '廣東話' : '普通话'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wizard-section">
                <h3>{t.currencySelect}</h3>
                <div className="language-options">
                  {(['USD', 'HKD', 'CNY'] as const).map((curr) => (
                    <button
                      key={curr}
                      className={`language-btn ${currency === curr ? 'active' : ''}`}
                      onClick={() => setCurrency(curr)}
                    >
                      {currencySymbols[curr]} {curr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="wizard-section">
                <h3>{t.consentTitle}</h3>
                <p className="section-desc">{t.consentDesc}</p>
                <div className="consent-options">
                  <label className={`consent-option ${consent.local_only ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={consent.local_only}
                      onChange={(e) => setConsent({ ...consent, local_only: e.target.checked })}
                    />
                    <ShieldCheck size={18} />
                    <span>{t.consentLocal}</span>
                  </label>
                  <label className={`consent-option ${consent.upload_redacted ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={consent.upload_redacted}
                      onChange={(e) => setConsent({ ...consent, upload_redacted: e.target.checked })}
                    />
                    <CheckCircle2 size={18} />
                    <span>{t.consentRedacted}</span>
                  </label>
                  <label className={`consent-option ${consent.upload_encrypted ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={consent.upload_encrypted}
                      onChange={(e) => setConsent({ ...consent, upload_encrypted: e.target.checked })}
                    />
                    <CheckCircle2 size={18} />
                    <span>{t.consentEncrypted}</span>
                  </label>
                  <label className={`consent-option ${consent.allow_retention ? 'active' : ''}`}>
                    <input
                      type="checkbox"
                      checked={consent.allow_retention}
                      onChange={(e) => setConsent({ ...consent, allow_retention: e.target.checked })}
                    />
                    <CheckCircle2 size={18} />
                    <span>{t.consentRetention}</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INTAKE */}
          {currentStep === 'intake' && (
            <div className="wizard-step animate-in">
              <div className="wizard-hero compact">
                <BrainCircuit size={28} />
                <h1>{t.intakeTitle}</h1>
                <p>{t.intakeDesc}</p>
              </div>

              <div className="intake-form">
                <div className="form-row">
                  <label>
                    <span>{t.qAge}</span>
                    <input
                      type="number"
                      value={userData.age || ''}
                      onChange={(e) => updateData('age', e.target.value ? Number(e.target.value) : null)}
                      placeholder="30"
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    <span>{t.qIncome}</span>
                    <input
                      type="text"
                      value={formatInputValue(userData.monthlyIncome)}
                      onChange={(e) => updateData('monthlyIncome', parseInputValue(e.target.value))}
                      placeholder="5,000"
                    />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    <span>{t.qRentalIncome}</span>
                    <input
                      type="text"
                      value={formatInputValue(userData.monthlyRentalIncome)}
                      onChange={(e) => updateData('monthlyRentalIncome', parseInputValue(e.target.value))}
                      placeholder="0"
                    />
                  </label>
                </div>

                <div className="form-row two-col">
                  <label>
                    <span>{t.qEssential}</span>
                    <input
                      type="text"
                      value={formatInputValue(userData.monthlyEssentialExpenses)}
                      onChange={(e) => updateData('monthlyEssentialExpenses', parseInputValue(e.target.value))}
                      placeholder="2,000"
                    />
                  </label>
                  <label>
                    <span>{t.qDiscretionary}</span>
                    <input
                      type="text"
                      value={formatInputValue(userData.monthlyDiscretionary)}
                      onChange={(e) => updateData('monthlyDiscretionary', parseInputValue(e.target.value))}
                      placeholder="500"
                    />
                  </label>
                </div>

                <div className="form-row two-col">
                  <label>
                    <span>{t.qSavings}</span>
                    <input
                      type="text"
                      value={formatInputValue(userData.totalSavings)}
                      onChange={(e) => updateData('totalSavings', parseInputValue(e.target.value))}
                      placeholder="10,000"
                    />
                  </label>
                </div>

                {/* Multi-Debt Input Section */}
                <div className="debt-section">
                  <div className="debt-header">
                    <span>{t.qDebt}</span>
                    <button type="button" className="add-debt-btn" onClick={addDebt}>
                      <Plus size={16} /> {t.addDebt}
                    </button>
                  </div>
                  
                  {userData.debts.length === 0 && (
                    <p className="debt-empty">No debts added. Click "Add debt" if you have any.</p>
                  )}
                  
                  {userData.debts.map((debt, index) => (
                    <div key={debt.id} className="debt-item">
                      <div className="debt-item-header">
                        <span className="debt-number">Debt #{index + 1}</span>
                        <button type="button" className="remove-debt-btn" onClick={() => removeDebt(debt.id)}>
                          <Trash2 size={14} /> {t.removeDebt}
                        </button>
                      </div>
                      <div className="debt-item-fields">
                        <div className="debt-field">
                          <label>{t.qDebtCategory}</label>
                          <select
                            value={debt.category}
                            onChange={(e) => updateDebt(debt.id, 'category', e.target.value)}
                          >
                            <option value="">Select...</option>
                            {debtCategories.map(cat => (
                              <option key={cat} value={cat}>{getDebtCategoryLabel(cat)}</option>
                            ))}
                          </select>
                        </div>
                        <div className="debt-field">
                          <label>{t.qDebtBalance}</label>
                          <input
                            type="text"
                            value={formatInputValue(debt.balance)}
                            onChange={(e) => updateDebt(debt.id, 'balance', parseInputValue(e.target.value))}
                            placeholder="5,000"
                          />
                        </div>
                        <div className="debt-field">
                          <label>{t.qDebtRate}</label>
                          <input
                            type="number"
                            value={debt.interestRate || ''}
                            onChange={(e) => updateDebt(debt.id, 'interestRate', e.target.value ? Number(e.target.value) : null)}
                            placeholder="18"
                            step="0.1"
                          />
                        </div>
                        <div className="debt-field">
                          <label>{t.qDebtPayment}</label>
                          <input
                            type="text"
                            value={formatInputValue(debt.minPayment)}
                            onChange={(e) => updateDebt(debt.id, 'minPayment', parseInputValue(e.target.value))}
                            placeholder="100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {userData.debts.length > 0 && (
                    <div className="debt-total">
                      <span>Total Debt:</span>
                      <strong>{formatCurrency(getTotalDebt())}</strong>
                    </div>
                  )}
                </div>

                {/* Real Estate Assets Section */}
                <div className="debt-section">
                  <div className="debt-header">
                    <span>{t.qRealEstate}</span>
                    <button type="button" className="add-debt-btn" onClick={addRealEstateAsset}>
                      <Plus size={16} /> {t.addRealEstate}
                    </button>
                  </div>
                  
                  {userData.realEstateAssets.length === 0 && (
                    <p className="debt-empty">No properties added. Click "Add property" if you own any real estate.</p>
                  )}
                  
                  {userData.realEstateAssets.map((asset, index) => (
                    <div key={asset.id} className="debt-item">
                      <div className="debt-item-header">
                        <span className="debt-number">Property #{index + 1}</span>
                        <button type="button" className="remove-debt-btn" onClick={() => removeRealEstateAsset(asset.id)}>
                          <Trash2 size={14} /> {t.removeRealEstate}
                        </button>
                      </div>
                      <div className="debt-item-fields">
                        <div className="debt-field">
                          <label>{t.qPropertyName}</label>
                          <input
                            type="text"
                            value={asset.propertyName}
                            onChange={(e) => updateRealEstateAsset(asset.id, 'propertyName', e.target.value)}
                            placeholder="e.g., My Flat in Kowloon"
                          />
                        </div>
                        <div className="debt-field">
                          <label>{t.qDistrict}</label>
                          <input
                            type="text"
                            value={asset.district}
                            onChange={(e) => updateRealEstateAsset(asset.id, 'district', e.target.value)}
                            placeholder="e.g., Kowloon City"
                          />
                        </div>
                        <div className="debt-field">
                          <label>{t.qPropertyType}</label>
                          <select
                            value={asset.propertyType}
                            onChange={(e) => updateRealEstateAsset(asset.id, 'propertyType', e.target.value)}
                          >
                            <option value="residential">{t.propertyTypeResidential}</option>
                            <option value="commercial">{t.propertyTypeCommercial}</option>
                            <option value="industrial">{t.propertyTypeIndustrial}</option>
                            <option value="parking">{t.propertyTypeParking}</option>
                            <option value="other">{t.propertyTypeOther}</option>
                          </select>
                        </div>
                        <div className="debt-field">
                          <label>{t.qPurchasePrice}</label>
                          <input
                            type="text"
                            value={formatInputValue(asset.purchasePrice)}
                            onChange={(e) => updateRealEstateAsset(asset.id, 'purchasePrice', parseInputValue(e.target.value))}
                            placeholder="5,000,000"
                          />
                        </div>
                        <div className="debt-field">
                          <label>{t.qCurrentValue}</label>
                          <input
                            type="text"
                            value={formatInputValue(asset.currentValue)}
                            onChange={(e) => updateRealEstateAsset(asset.id, 'currentValue', parseInputValue(e.target.value))}
                            placeholder="6,000,000"
                          />
                        </div>
                        <div className="debt-field">
                          <label>{t.qMortgageBalance}</label>
                          <input
                            type="text"
                            value={formatInputValue(asset.mortgageBalance)}
                            onChange={(e) => updateRealEstateAsset(asset.id, 'mortgageBalance', parseInputValue(e.target.value))}
                            placeholder="4,000,000"
                          />
                        </div>
                        <div className="debt-field checkbox-field">
                          <label>
                            <input
                              type="checkbox"
                              checked={asset.isRented}
                              onChange={(e) => updateRealEstateAsset(asset.id, 'isRented', e.target.checked)}
                            />
                            {t.qIsRented}
                          </label>
                        </div>
                        {asset.isRented && (
                          <>
                            <div className="debt-field">
                              <label>{t.qMonthlyRent}</label>
                              <input
                                type="text"
                                value={formatInputValue(asset.monthlyRent)}
                                onChange={(e) => updateRealEstateAsset(asset.id, 'monthlyRent', parseInputValue(e.target.value))}
                                placeholder="15,000"
                              />
                            </div>
                            <div className="debt-field">
                              <label>{t.qMonthlyExpenses}</label>
                              <input
                                type="text"
                                value={formatInputValue(asset.monthlyExpenses)}
                                onChange={(e) => updateRealEstateAsset(asset.id, 'monthlyExpenses', parseInputValue(e.target.value))}
                                placeholder="1,000"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {userData.realEstateAssets.length > 0 && (
                    <div className="debt-total">
                      <span>Total Property Value:</span>
                      <strong>{formatCurrency(getTotalRealEstateValue())}</strong>
                      {getTotalRealEstateRentalIncome() > 0 && (
                        <>
                          <span style={{ marginLeft: 20 }}>Monthly Rental Income:</span>
                          <strong>{formatCurrency(getTotalRealEstateRentalIncome())}</strong>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <label>
                    <span>{t.qEmployment}</span>
                    <div className="button-group">
                      <button
                        className={userData.employmentStability === 'stable' ? 'active' : ''}
                        onClick={() => updateData('employmentStability', 'stable')}
                      >
                        {t.employmentStable}
                      </button>
                      <button
                        className={userData.employmentStability === 'variable' ? 'active' : ''}
                        onClick={() => updateData('employmentStability', 'variable')}
                      >
                        {t.employmentVariable}
                      </button>
                    </div>
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    <span>{t.qRisk}</span>
                    <div className="risk-slider">
                      <div className="risk-labels">
                        <span>{t.riskSell}</span>
                        <span>{t.riskHold}</span>
                        <span>{t.riskBuy}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={userData.riskScore}
                        onChange={(e) => updateData('riskScore', Number(e.target.value))}
                        className="slider"
                      />
                      <div className="risk-value">{userData.riskScore}/10</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HEALTH METRICS */}
          {currentStep === 'health' && (
            <div className="wizard-step animate-in">
              <div className="wizard-hero compact">
                <TrendingUp size={28} />
                <h1>{t.healthTitle}</h1>
                <p>{t.healthDesc}</p>
              </div>

              <div className="health-grid">
                {/* Savings Rate */}
                <div className={`health-card ${getStatus(metrics.savingsRate, 20, 10)}`}>
                  <div className="health-icon"><Wallet size={20} /></div>
                  <div className="health-info">
                    <span className="health-label">{t.savingsRate}</span>
                    <strong className="health-value">
                      {metrics.savingsRate !== null ? `${metrics.savingsRate.toFixed(1)}%` : '—'}
                    </strong>
                    <span className="health-desc">{t.savingsRateDesc}</span>
                  </div>
                  <div className={`health-status ${getStatus(metrics.savingsRate, 20, 10)}`}>
                    {getStatus(metrics.savingsRate, 20, 10) === 'good' && <CheckCircle2 size={14} />}
                    {getStatus(metrics.savingsRate, 20, 10) === 'watch' && <AlertTriangle size={14} />}
                    {getStatus(metrics.savingsRate, 20, 10) === 'urgent' && <AlertCircle size={14} />}
                    <span>
                      {getStatus(metrics.savingsRate, 20, 10) === 'good' ? t.statusGood :
                       getStatus(metrics.savingsRate, 20, 10) === 'watch' ? t.statusWatch :
                       getStatus(metrics.savingsRate, 20, 10) === 'urgent' ? t.statusUrgent : '—'}
                    </span>
                  </div>
                </div>

                {/* DTI */}
                <div className={`health-card ${getStatus(metrics.dti, 36, 43)}`}>
                  <div className="health-icon"><AlertCircle size={20} /></div>
                  <div className="health-info">
                    <span className="health-label">{t.dti}</span>
                    <strong className="health-value">
                      {metrics.dti !== null ? `${metrics.dti.toFixed(1)}%` : '—'}
                    </strong>
                    <span className="health-desc">{t.dtiDesc}</span>
                  </div>
                  <div className={`health-status ${getStatus(metrics.dti, 36, 43)}`}>
                    {getStatus(metrics.dti, 36, 43) === 'good' && <CheckCircle2 size={14} />}
                    {getStatus(metrics.dti, 36, 43) === 'watch' && <AlertTriangle size={14} />}
                    {getStatus(metrics.dti, 36, 43) === 'urgent' && <AlertCircle size={14} />}
                    <span>
                      {getStatus(metrics.dti, 36, 43) === 'good' ? t.statusGood :
                       getStatus(metrics.dti, 36, 43) === 'watch' ? t.statusWatch :
                       getStatus(metrics.dti, 36, 43) === 'urgent' ? t.statusUrgent : '—'}
                    </span>
                  </div>
                </div>

                {/* Emergency Fund */}
                <div className={`health-card ${getStatus(metrics.emergencyFundMonths, 6, 3)}`}>
                  <div className="health-icon"><ShieldCheck size={20} /></div>
                  <div className="health-info">
                    <span className="health-label">{t.emergencyFund}</span>
                    <strong className="health-value">
                      {metrics.emergencyFundMonths !== null ? `${metrics.emergencyFundMonths.toFixed(1)} ${t.months}` : '—'}
                    </strong>
                    <span className="health-desc">{t.emergencyFundDesc}</span>
                  </div>
                  <div className={`health-status ${getStatus(metrics.emergencyFundMonths, 6, 3)}`}>
                    {getStatus(metrics.emergencyFundMonths, 6, 3) === 'good' && <CheckCircle2 size={14} />}
                    {getStatus(metrics.emergencyFundMonths, 6, 3) === 'watch' && <AlertTriangle size={14} />}
                    {getStatus(metrics.emergencyFundMonths, 6, 3) === 'urgent' && <AlertCircle size={14} />}
                    <span>
                      {getStatus(metrics.emergencyFundMonths, 6, 3) === 'good' ? t.statusGood :
                       getStatus(metrics.emergencyFundMonths, 6, 3) === 'watch' ? t.statusWatch :
                       getStatus(metrics.emergencyFundMonths, 6, 3) === 'urgent' ? t.statusUrgent : '—'}
                    </span>
                  </div>
                </div>

                {/* Net Worth */}
                <div className="health-card neutral">
                  <div className="health-icon"><TrendingUp size={20} /></div>
                  <div className="health-info">
                    <span className="health-label">{t.netWorth}</span>
                    <strong className="health-value">
                      {formatCurrency(metrics.netWorth)}
                    </strong>
                    <span className="health-desc">{t.netWorthDesc}</span>
                  </div>
                  <div className="health-status neutral">
                    <span>—</span>
                  </div>
                </div>
              </div>

              {/* Wealth Leaks */}
              {userData.monthlyDiscretionary && userData.monthlyDiscretionary > 0 && (
                <div className="wealth-leaks">
                  <h3>{t.topLeaks}</h3>
                  <div className="leak-item">
                    <span>Discretionary spending</span>
                    <strong>{formatCurrency(userData.monthlyDiscretionary)}/mo</strong>
                  </div>
                  {getTotalDebt() > 0 && getWeightedInterestRate() > 10 && (
                    <div className="leak-item">
                      <span>Interest on debt</span>
                      <strong>{formatCurrency(Math.round(metrics.totalDebt * getWeightedInterestRate() / 100 / 12))}/mo</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 4: GOALS */}
          {currentStep === 'goals' && (
            <div className="wizard-step animate-in">
              <div className="wizard-hero compact">
                <Target size={28} />
                <h1>{t.goalsTitle}</h1>
                <p>{t.goalsDesc}</p>
              </div>

              <div className="goals-list">
                {[
                  { id: 'wealth', name: t.goalWealth, defaultTimeline: 10 },
                  { id: 'home', name: t.goalHome, defaultTimeline: 5 },
                  { id: 'retire', name: t.goalRetire, defaultTimeline: 20 },
                  { id: 'education', name: t.goalEducation, defaultTimeline: 3 },
                  { id: 'emergency', name: t.goalEmergency, defaultTimeline: 1 },
                  { id: 'debt', name: t.goalDebt, defaultTimeline: 2 },
                ].map((goal, index) => {
                  const isSelected = userData.goals.some(g => g.id === goal.id)
                  const goalPriority = userData.goals.find(g => g.id === goal.id)?.priority

                  return (
                    <div
                      key={goal.id}
                      className={`goal-item ${isSelected ? 'selected' : ''} ${goalPriority ? `priority-${goalPriority}` : ''}`}
                      onClick={() => {
                        if (isSelected) {
                          updateData('goals', userData.goals.filter(g => g.id !== goal.id))
                        } else if (userData.goals.length < 3) {
                          updateData('goals', [...userData.goals, { 
                            id: goal.id, 
                            name: goal.name, 
                            timeline: goal.defaultTimeline,
                            priority: userData.goals.length + 1
                          }])
                        }
                      }}
                    >
                      <div className="goal-check">
                        {isSelected && <Check size={16} />}
                      </div>
                      <div className="goal-content">
                        <span className="goal-name">{goal.name}</span>
                        {isSelected && (
                          <div className="goal-details">
                            <span>{t.timelineYears}: </span>
                            <input
                              type="number"
                              value={userData.goals.find(g => g.id === goal.id)?.timeline || goal.defaultTimeline}
                              onChange={(e) => {
                                const newGoals = userData.goals.map(g => 
                                  g.id === goal.id ? { ...g, timeline: Number(e.target.value) } : g
                                )
                                updateData('goals', newGoals)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              min="1"
                              max="50"
                            />
                          </div>
                        )}
                      </div>
                      {goalPriority && (
                        <div className="goal-priority">#{goalPriority}</div>
                      )}
                    </div>
                  )
                })}
              </div>

              <p className="goals-hint">
                {userData.goals.length === 0 && 'Select up to 3 goals'}
                {userData.goals.length > 0 && userData.goals.length < 3 && `${3 - userData.goals.length} more to prioritize`}
              </p>
            </div>
          )}

          {/* STEP 5: ACTION PLAN */}
          {currentStep === 'action' && (
            <div className="wizard-step animate-in">
              <div className="wizard-hero compact">
                <CheckCircle2 size={28} />
                <h1>{t.actionTitle}</h1>
                <p>{t.actionDesc}</p>
              </div>

              {/* Recommendations Tabs */}
              <div className="rec-tabs">
                <button 
                  className={activeTab === 'portfolio' ? 'active' : ''}
                  onClick={() => setActiveTab('portfolio')}
                >
                  <PieChart size={16} /> {t.portfolio}
                </button>
                <button 
                  className={activeTab === 'debt' ? 'active' : ''}
                  onClick={() => setActiveTab('debt')}
                >
                  <CreditCard size={16} /> {t.debtPayoff}
                </button>
                <button 
                  className={activeTab === 'tax' ? 'active' : ''}
                  onClick={() => setActiveTab('tax')}
                >
                  <Receipt size={16} /> {t.taxOpt}
                </button>
              </div>

              {/* Tab Content */}
              <div className="rec-content">
                {/* Portfolio Tab */}
                {activeTab === 'portfolio' && (
                  <div className="rec-panel portfolio-panel">
                    <div className="rec-header">
                      <h3>{t.portfolioTitle}</h3>
                      <p>{t.portfolioDesc}</p>
                    </div>
                    <div className="portfolio-grid">
                      <div className="portfolio-stat">
                        <span className="stat-label">{t.portfolioStrategy}</span>
                        <span className="stat-value">{t[portfolio.strategy]}</span>
                      </div>
                      <div className="portfolio-stat">
                        <span className="stat-label">{t.portfolioExpectedReturn}</span>
                        <span className="stat-value">{portfolio.expectedReturn}%</span>
                      </div>
                      <div className="portfolio-stat">
                        <span className="stat-label">{t.portfolioRiskLevel}</span>
                        <span className={`stat-value risk-${portfolio.risk}`}>{t[`portfolio${portfolio.risk.charAt(0).toUpperCase() + portfolio.risk.slice(1)}` as keyof typeof t] || t.portfolioMedium}</span>
                      </div>
                    </div>
                    <div className="allocation-bar">
                      <div className="allocation-label">{t.portfolioAllocation}</div>
                      <div className="bar-container">
                        <div className="bar-segment stocks" style={{ width: `${portfolio.stocks}%` }}>{portfolio.stocks > 10 ? `${portfolio.stocks}%` : ''}</div>
                        <div className="bar-segment bonds" style={{ width: `${portfolio.bonds}%` }}>{portfolio.bonds > 10 ? `${portfolio.bonds}%` : ''}</div>
                        <div className="bar-segment cash" style={{ width: `${portfolio.cash}%` }}>{portfolio.cash > 10 ? `${portfolio.cash}%` : ''}</div>
                      </div>
                      <div className="allocation-legend">
                        <span className="legend-item"><span className="dot stocks"></span>{t.portfolioStocks}</span>
                        <span className="legend-item"><span className="dot bonds"></span>{t.portfolioBonds}</span>
                        <span className="legend-item"><span className="dot cash"></span>{t.portfolioCash}</span>
                      </div>
                    </div>
                    <p className="rec-note">{t.portfolioNote}</p>
                  </div>
                )}

                {/* Debt Payoff Tab */}
                {activeTab === 'debt' && (
                  <div className="rec-panel debt-panel">
                    <div className="rec-header">
                      <h3>{t.debtPayoffTitle}</h3>
                      <p>{t.debtPayoffDesc}</p>
                    </div>
                    {getTotalDebt() > 0 ? (
                      <>
                        <div className="debt-summary">
                          <div className="debt-stat">
                            <span className="stat-label">{t.debtTotal}</span>
                            <span className="stat-value debt">{formatCurrency(getTotalDebt())}</span>
                          </div>
                          <div className="debt-stat">
                            <span className="stat-label">{t.debtAvgRate}</span>
                            <span className="stat-value">{getWeightedInterestRate().toFixed(1)}%</span>
                          </div>
                          <div className="debt-stat">
                            <span className="stat-label">{t.debtMinPayment}</span>
                            <span className="stat-value">{formatCurrency(getTotalMinPayment())}</span>
                          </div>
                        </div>
                        <div className="payoff-method">
                          <label>{t.debtPayoffMethod}</label>
                          <div className="method-buttons">
                            <button 
                              className={debtPayoffMethod === 'avalanche' ? 'active' : ''}
                              onClick={() => setDebtPayoffMethod('avalanche')}
                            >
                              {t.debtAvalanche}
                            </button>
                            <button 
                              className={debtPayoffMethod === 'snowball' ? 'active' : ''}
                              onClick={() => setDebtPayoffMethod('snowball')}
                            >
                              {t.debtSnowball}
                            </button>
                          </div>
                        </div>
                        <div className="extra-payment">
                          <label>{t.debtPayoffExtra}</label>
                          <input
                            type="text"
                            value={formatInputValue(extraPayment)}
                            onChange={(e) => setExtraPayment(parseInputValue(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                        {payoffPlan && (
                          <div className="payoff-results">
                            <div className="payoff-result">
                              <span className="result-label">{t.debtPayoffMonths}</span>
                              <span className="result-value">{payoffPlan.months} {t.monthsToPayoff}</span>
                            </div>
                            {extraPayment > 0 && payoffPlan.interestSaved > 0 && (
                              <div className="payoff-result highlight">
                                <span className="result-label">{t.debtInterestSaved}</span>
                                <span className="result-value">{formatCurrency(payoffPlan.interestSaved)}</span>
                              </div>
                            )}
                          </div>
                        )}
                        {payoffPlan && payoffPlan.priority.length > 0 && (
                          <div className="priority-list">
                            <h4>{t.debtPriorityOrder}</h4>
                            {payoffPlan.priority.map((item, i) => (
                              <div key={i} className="priority-item">
                                <span className="priority-num">{i + 1}</span>
                                <span className="priority-cat">{getDebtCategoryLabel(item.category || '')}</span>
                                <span className="priority-bal">{formatCurrency(item.balance || 0)}</span>
                                <span className="priority-rate">@{item.rate}%</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="no-debt">No debt to payoff. Great job!</p>
                    )}
                  </div>
                )}

                {/* Tax Tab */}
                {activeTab === 'tax' && (
                  <div className="rec-panel tax-panel">
                    <div className="rec-header">
                      <h3>{t.taxOptTitle}</h3>
                      <p>{t.taxOptDesc}</p>
                    </div>
                    <div className="filing-status">
                      <label>{t.taxFilingStatus}</label>
                      <select value={filingStatus} onChange={(e) => setFilingStatus(e.target.value as any)}>
                        <option value="single">{t.taxSingle}</option>
                        <option value="married_joint">{t.taxMarried}</option>
                        <option value="married_separate">{t.taxMarriedSep}</option>
                        <option value="head">{t.taxHead}</option>
                      </select>
                    </div>
                    {taxInfo ? (
                      <>
                        <div className="tax-summary">
                          <div className="tax-stat">
                            <span className="stat-label">{t.taxEstimatedTax}</span>
                            <span className="stat-value">{formatCurrency(taxInfo.estimatedTax)}</span>
                          </div>
                          <div className="tax-stat">
                            <span className="stat-label">{t.taxEffectiveRate}</span>
                            <span className="stat-value">{taxInfo.effectiveRate.toFixed(1)}%</span>
                          </div>
                          <div className="tax-stat">
                            <span className="stat-label">{t.taxMarginalRate}</span>
                            <span className="stat-value">{(taxInfo.marginalRate * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="tax-deductions">
                          <h4>{t.taxDeductions}</h4>
                          <div className="deduction-item">
                            <span className="deduction-label">{t.taxStandard}</span>
                            <span className="deduction-value">{formatCurrency(taxInfo.standardDeduction)}</span>
                          </div>
                          <div className="deduction-item">
                            <span className="deduction-label">{t.tax401k}</span>
                            <span className="deduction-value">{formatCurrency(taxInfo.potentialDeductions.max401k)}</span>
                          </div>
                          <div className="deduction-item">
                            <span className="deduction-label">{t.taxIRA}</span>
                            <span className="deduction-value">{formatCurrency(taxInfo.potentialDeductions.maxIRA)}</span>
                          </div>
                          <div className="deduction-item">
                            <span className="deduction-label">{t.taxHSA}</span>
                            <span className="deduction-value">{formatCurrency(taxInfo.potentialDeductions.maxHSA)}</span>
                          </div>
                        </div>
                        <div className="tax-tips">
                          <h4>{t.taxTaxTips}</h4>
                          <ul>
                            <li>Contribute to 401(k) up to employer match</li>
                            <li>Maximize HSA if eligible for triple tax advantage</li>
                            <li>Consider Roth IRA for tax-free growth</li>
                            <li>Harvest losses to offset gains</li>
                          </ul>
                        </div>
                      </>
                    ) : (
                      <p className="no-income">Enter your income to see tax estimates.</p>
                    )}
                  </div>
                )}
              </div>

              <div className="action-list">
                {actionItems.map((action, index) => (
                  <div key={index} className={`action-item ${action.type}`}>
                    <div className="action-badge">
                      {action.type === 'immediate' && <span className="badge immediate">{t.immediate}</span>}
                      {action.type === 'shortTerm' && <span className="badge short-term">{t.shortTerm}</span>}
                      {action.type === 'longTerm' && <span className="badge long-term">{t.longTerm}</span>}
                    </div>
                    <div className="action-content">
                      <h4>{action.title}</h4>
                      <p>{action.desc}</p>
                    </div>
                    <div className="action-meta">
                      {action.benefit && (
                        <span className="benefit">{formatCurrency(action.benefit)}{action.type === 'immediate' ? t.monthlyBenefit : t.yearlyBenefit}</span>
                      )}
                      <span className="effort">{action.effort} effort</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* STEP 6: X-RAY RESULTS */}
        {currentStep === 'xray' && (
          <div className="wizard-step animate-in xray-step">
            <div className="wizard-hero compact">
              <Sparkles size={28} />
              <h1>{t.xrayTitle}</h1>
              <p>{t.xrayDesc}</p>
            </div>

            {/* Health Score */}
            <div className="xray-score-card">
              <div className="score-circle" data-level={healthScoreLevel}>
                <span className="score-number">{healthScore}</span>
                <span className="score-label">{healthScoreLabel}</span>
              </div>
              <div className="score-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-label">{t.netWorth}</span>
                  <span className="breakdown-value">{formatCurrency(metrics.netWorth)}</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-label">{t.safeToSpend}</span>
                  <span className="breakdown-value">{formatCurrency(safeToSpend)}/mo</span>
                </div>
              </div>
            </div>

            {/* Top 3 Problems */}
            {topProblems.length > 0 && (
              <div className="xray-problems">
                <h3>{t.topProblems}</h3>
                {topProblems.map((problem, index) => (
                  <div key={index} className="problem-item">
                    <div className="problem-header">
                      <span className="problem-num">{index + 1}</span>
                      <span className="problem-title">{getProblemLabel(problem)}</span>
                      <button 
                        className="problem-toggle"
                        onClick={(e) => {
                          const details = e.currentTarget.parentElement?.querySelector('.problem-details') as HTMLElement
                          if (details) details.style.display = details.style.display === 'block' ? 'none' : 'block'
                        }}
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    <div className="problem-details">
                      <p>{getProblemDescription(problem)}</p>
                      <button className="tell-more-btn">{t.tellMeMore}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* CTA Button */}
            <button className="xray-cta primary-button" onClick={() => onComplete?.(userData)}>
              {t.getActionPlan} <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="wizard-footer">
          <button
            className="wizard-btn secondary"
            onClick={prevStep}
            disabled={stepIndex === 0}
          >
            <ArrowLeft size={16} />
            {t.back}
          </button>
          
          <button className="wizard-btn primary" onClick={nextStep}>
            {stepIndex === totalSteps - 1 ? t.finish : t.next}
            {stepIndex < totalSteps - 1 && <ArrowRight size={16} />}
          </button>
        </footer>

        {/* Chat Button */}
        <button 
          className="chat-fab"
          onClick={() => setChatOpen(true)}
          aria-label={t.assistant}
        >
          <MessageCircle size={20} />
        </button>

        {/* Chat Panel */}
        {chatOpen && (
          <div className="chat-panel">
            <header>
              <strong>{t.assistant}</strong>
              <button onClick={() => setChatOpen(false)}><X size={16} /></button>
            </header>
            <div className="chat-messages">
              {chatMessages.length === 0 && (
                <div className="chat-empty">
                  <Sparkles size={18} />
                  <p>{language === 'yue' ? '你可以問我任何關於你財務嘅問題！' : language === 'zh' ? '你可以问我任何关于财务的问题！' : 'Ask me anything about your finances!'}</p>
                </div>
              )}
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-msg ${msg.role}`}>
                  {msg.content}
                </div>
              ))}
              {chatLoading && <div className="chat-msg assistant">...</div>}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); void sendChat() }}>
              <input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t.askQuestion}
                disabled={chatLoading}
              />
              <button type="submit" disabled={chatLoading || !chatInput.trim()}>
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .wizard-overlay {
          position: fixed;
          inset: 0;
          background: rgba(16, 43, 64, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .wizard-container {
          background: #0a1a26;
          border-radius: 16px;
          width: 100%;
          max-width: 680px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .wizard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .wizard-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .wizard-brand .brand-mark {
          width: 32px;
          height: 32px;
        }

        .wizard-brand .brand-name {
          font-weight: 600;
          font-size: 14px;
          color: #fff;
        }

        .wizard-progress {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .wizard-progress span {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .progress-bar {
          width: 120px;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        .wizard-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 4px;
        }

        .wizard-close:hover {
          color: #fff;
        }

        .wizard-content {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .wizard-step {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .wizard-hero {
          text-align: center;
          margin-bottom: 32px;
        }

        .wizard-hero svg {
          color: #3b82f6;
          margin-bottom: 12px;
        }

        .wizard-hero.compact {
          margin-bottom: 24px;
        }

        .wizard-hero.compact svg {
          display: none;
        }

        .wizard-hero h1 {
          font-size: 24px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 8px;
        }

        .wizard-hero p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
        }

        .wizard-section {
          margin-bottom: 24px;
        }

        .wizard-section h3 {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 12px;
        }

        .section-desc {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 12px;
        }

        .language-options {
          display: flex;
          gap: 8px;
        }

        .language-btn {
          flex: 1;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .language-btn:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .language-btn.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          color: #fff;
        }

        .consent-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .consent-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .consent-option:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .consent-option.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .consent-option input {
          display: none;
        }

        .consent-option svg {
          color: rgba(255, 255, 255, 0.4);
        }

        .consent-option.active svg {
          color: #3b82f6;
        }

        .consent-option span {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Intake Form */
        .intake-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-row {
          display: flex;
          gap: 12px;
        }

        .form-row.two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
        }

        .form-row label {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .form-row label > span {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .form-row input {
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 14px;
        }

        .form-row input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .form-row input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }

        .button-group {
          display: flex;
          gap: 8px;
        }

        .button-group button {
          flex: 1;
          padding: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .button-group button:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .button-group button.active {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
          color: #fff;
        }

        .risk-slider {
          padding: 12px 0;
        }

        .risk-labels {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 8px;
        }

        .slider {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          outline: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }

        .risk-value {
          text-align: center;
          font-size: 14px;
          color: #3b82f6;
          font-weight: 600;
          margin-top: 8px;
        }

        /* Health Metrics */
        .health-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        .health-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .health-card.good {
          border-color: rgba(34, 197, 94, 0.3);
          background: rgba(34, 197, 94, 0.05);
        }

        .health-card.watch {
          border-color: rgba(251, 191, 36, 0.3);
          background: rgba(251, 191, 36, 0.05);
        }

        .health-card.urgent {
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.05);
        }

        .health-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.6);
        }

        .health-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .health-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .health-value {
          font-size: 20px;
          font-weight: 700;
          color: #fff;
        }

        .health-desc {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        .health-status {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          width: fit-content;
        }

        .health-status.good {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .health-status.watch {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
        }

        .health-status.urgent {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .health-status.neutral {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.4);
        }

        .wealth-leaks {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 16px;
        }

        .wealth-leaks h3 {
          font-size: 13px;
          font-weight: 600;
          color: #ef4444;
          margin-bottom: 12px;
        }

        .leak-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(239, 68, 68, 0.1);
          font-size: 13px;
        }

        .leak-item:last-child {
          border-bottom: none;
        }

        .leak-item span {
          color: rgba(255, 255, 255, 0.6);
        }

        .leak-item strong {
          color: #ef4444;
        }

        /* Goals */
        .goals-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .goal-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .goal-item:hover {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .goal-item.selected {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.08);
        }

        .goal-check {
          width: 22px;
          height: 22px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
        }

        .goal-item.selected .goal-check {
          background: #3b82f6;
          border-color: #3b82f6;
          color: #fff;
        }

        .goal-content {
          flex: 1;
        }

        .goal-name {
          font-size: 14px;
          color: #fff;
        }

        .goal-details {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 4px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .goal-details input {
          width: 50px;
          padding: 4px 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 12px;
        }

        .goal-priority {
          font-size: 14px;
          font-weight: 700;
          color: #3b82f6;
        }

        .goals-hint {
          text-align: center;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 16px;
        }

        /* Action Items */
        .action-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .action-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
        }

        .action-badge {
          flex-shrink: 0;
        }

        .badge {
          font-size: 10px;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .badge.immediate {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
        }

        .badge.short-term {
          background: rgba(251, 191, 36, 0.15);
          color: #fbbf24;
        }

        .badge.long-term {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }

        .action-content {
          flex: 1;
        }

        .action-content h4 {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 2px;
        }

        .action-content p {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }

        .action-meta {
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .benefit {
          font-size: 13px;
          font-weight: 600;
          color: #22c55e;
        }

        .effort {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Footer */
        .wizard-footer {
          display: flex;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .wizard-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .wizard-btn.secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.7);
        }

        .wizard-btn.secondary:hover:not(:disabled) {
          border-color: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .wizard-btn.secondary:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .wizard-btn.primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          color: #fff;
        }

        .wizard-btn.primary:hover {
          opacity: 0.9;
        }

        /* Chat FAB */
        .chat-fab {
          position: absolute;
          bottom: 24px;
          right: 24px;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
          transition: transform 0.2s;
        }

        .chat-fab:hover {
          transform: scale(1.05);
        }

        /* Chat Panel */
        .chat-panel {
          position: absolute;
          bottom: 80px;
          right: 24px;
          width: 320px;
          height: 400px;
          background: #0a1a26;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
        }

        .chat-panel header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .chat-panel header strong {
          font-size: 14px;
          color: #fff;
        }

        .chat-panel header button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .chat-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: rgba(255, 255, 255, 0.5);
          text-align: center;
          gap: 8px;
        }

        .chat-empty svg {
          color: #3b82f6;
        }

        .chat-empty p {
          font-size: 13px;
        }

        .chat-msg {
          padding: 10px 12px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.4;
          max-width: 85%;
        }

        .chat-msg.user {
          background: #3b82f6;
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }

        .chat-msg.assistant {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }

        .chat-panel form {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .chat-panel form input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
          font-size: 13px;
        }

        .chat-panel form input:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .chat-panel form button {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #3b82f6;
          border: none;
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-panel form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Debt Section Styles */
        .debt-section {
          margin-top: 8px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .debt-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .debt-header span {
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.9);
        }

        .add-debt-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 6px;
          color: #60a5fa;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .add-debt-btn:hover {
          background: rgba(59, 130, 246, 0.25);
          border-color: rgba(59, 130, 246, 0.5);
        }

        .debt-empty {
          text-align: center;
          color: rgba(255, 255, 255, 0.4);
          font-size: 13px;
          padding: 20px;
        }

        .debt-item {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 10px;
        }

        .debt-item-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .debt-number {
          font-size: 12px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .remove-debt-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          background: transparent;
          border: none;
          color: #f87171;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .remove-debt-btn:hover {
          color: #fca5a5;
        }

        .debt-item-fields {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .debt-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .debt-field label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .debt-field input,
        .debt-field select {
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
          transition: all 0.2s;
        }

        .debt-field input:focus,
        .debt-field select:focus {
          outline: none;
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .debt-field input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .debt-field select {
          cursor: pointer;
        }

        .debt-field select option {
          background: #1e293b;
          color: #fff;
        }

        .debt-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 8px;
          margin-top: 8px;
        }

        .debt-total span {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .debt-total strong {
          font-size: 16px;
          color: #60a5fa;
        }

        /* Recommendations Tabs */
        .rec-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .rec-tabs button {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .rec-tabs button:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .rec-tabs button.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.5);
          color: #fff;
        }

        .rec-content {
          margin-bottom: 20px;
        }

        .rec-panel {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 16px;
        }

        .rec-header {
          margin-bottom: 16px;
        }

        .rec-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px;
        }

        .rec-header p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          margin: 0;
        }

        /* Portfolio Panel */
        .portfolio-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .portfolio-stat, .debt-stat, .tax-stat {
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
        }

        .stat-value.debt {
          color: #f87171;
        }

        .stat-value.risk-high {
          color: #f87171;
        }

        .stat-value.risk-medium {
          color: #fbbf24;
        }

        .stat-value.risk-low {
          color: #4ade80;
        }

        .allocation-bar {
          margin-bottom: 12px;
        }

        .allocation-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }

        .bar-container {
          display: flex;
          height: 28px;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .bar-segment {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
        }

        .bar-segment.stocks {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .bar-segment.bonds {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .bar-segment.cash {
          background: linear-gradient(135deg, #6b7280, #4b5563);
        }

        .allocation-legend {
          display: flex;
          gap: 16px;
          justify-content: center;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .legend-item .dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .legend-item .dot.stocks { background: #3b82f6; }
        .legend-item .dot.bonds { background: #10b981; }
        .legend-item .dot.cash { background: #6b7280; }

        .rec-note {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          font-style: italic;
        }

        /* Debt Panel */
        .debt-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }

        .payoff-method, .extra-payment, .filing-status {
          margin-bottom: 14px;
        }

        .payoff-method label, .extra-payment label, .filing-status label {
          display: block;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }

        .method-buttons {
          display: flex;
          gap: 8px;
        }

        .method-buttons button {
          flex: 1;
          padding: 10px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .method-buttons button.active {
          background: rgba(59, 130, 246, 0.2);
          border-color: #3b82f6;
          color: #fff;
        }

        .extra-payment input, .filing-status select {
          width: 100%;
          padding: 10px 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: #fff;
          font-size: 14px;
        }

        .extra-payment input:focus, .filing-status select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .filing-status select option {
          background: #1e293b;
        }

        .payoff-results {
          display: flex;
          gap: 12px;
          margin-bottom: 14px;
        }

        .payoff-result {
          flex: 1;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 8px;
          text-align: center;
        }

        .payoff-result.highlight {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .result-label {
          display: block;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .result-value {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
        }

        .payoff-result.highlight .result-value {
          color: #34d399;
        }

        .priority-list h4, .tax-deductions h4, .tax-tips h4 {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin: 0 0 10px;
        }

        .priority-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          margin-bottom: 6px;
        }

        .priority-num {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(59, 130, 246, 0.3);
          border-radius: 50%;
          font-size: 11px;
          font-weight: 600;
          color: #60a5fa;
        }

        .priority-cat {
          flex: 1;
          font-size: 13px;
          color: #fff;
        }

        .priority-bal {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .priority-rate {
          font-size: 12px;
          color: #f87171;
        }

        .no-debt, .no-income {
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          padding: 30px;
        }

        /* Tax Panel */
        .tax-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 16px;
        }

        .tax-deductions {
          margin-bottom: 16px;
        }

        .deduction-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 6px;
          margin-bottom: 6px;
        }

        .deduction-label {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
        }

        .deduction-value {
          font-size: 13px;
          font-weight: 600;
          color: #4ade80;
        }

        .tax-tips ul {
          margin: 0;
          padding-left: 20px;
        }

        .tax-tips li {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 6px;
        }

        /* X-Ray Results */
        .xray-step {
          padding-bottom: 20px;
        }

        .xray-score-card {
          display: flex;
          align-items: center;
          gap: 24px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .score-circle {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .score-circle[data-level="excellent"] {
          background: linear-gradient(135deg, #10b981, #059669);
        }

        .score-circle[data-level="good"] {
          background: linear-gradient(135deg, #22c55e, #16a34a);
        }

        .score-circle[data-level="fair"] {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .score-circle[data-level="needs-work"] {
          background: linear-gradient(135deg, #ef4444, #dc2626);
        }

        .score-number {
          font-size: 36px;
          font-weight: 700;
          color: white;
          line-height: 1;
        }

        .score-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.9);
          margin-top: 4px;
        }

        .score-breakdown {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .breakdown-label {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }

        .breakdown-value {
          font-size: 18px;
          font-weight: 600;
          color: white;
        }

        .xray-problems {
          margin-bottom: 24px;
        }

        .xray-problems h3 {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 12px;
        }

        .problem-item {
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 10px;
          margin-bottom: 8px;
          overflow: hidden;
        }

        .problem-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          cursor: pointer;
        }

        .problem-num {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.3);
          color: #ef4444;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .problem-title {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: white;
        }

        .problem-toggle {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 4px;
        }

        .problem-details {
          display: none;
          padding: 0 14px 14px;
        }

        .problem-details p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .tell-more-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 6px;
          padding: 8px 14px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          transition: all 0.2s;
        }

        .tell-more-btn:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .xray-cta {
          width: 100%;
          padding: 16px 24px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
      `}</style>
    </div>
  )
}
