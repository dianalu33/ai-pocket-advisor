import { NextResponse } from 'next/server'

type Language = 'en' | 'yue' | 'zh'

const copy = {
  en: {
    fallback: 'I can help you understand your allocation, emergency fund, market themes, and next steps. I provide educational guidance, not personalized financial advice.',
    crypto: 'Crypto can be a small satellite position, but it is highly volatile. Keep your emergency fund separate and avoid investing money you may need soon.',
    emergency: 'A useful first target is 3–6 months of essential expenses. Build that cash buffer before increasing higher-volatility investments.',
    allocation: 'Your allocation is designed around your stated risk level, timeline, and interests. Favor the core diversified assets first, then treat crypto and thematic ideas as optional satellites.',
    market: 'Markets move every day. Use the market brief for context, not as a reason to make a rushed trade. A consistent plan usually matters more than timing.',
    suggestions: ['Explain my allocation', 'How much emergency savings do I need?', 'Should I add more crypto?'],
  },
  yue: {
    fallback: '我可以幫你了解資產配置、應急儲蓄、市場主題同下一步。我提供教育性資訊，唔係個人化財務建議。',
    crypto: '加密貨幣可以係小比例嘅衛星配置，但波動好大。請先分開應急儲蓄，唔好用短期需要嘅錢投資。',
    emergency: '一個實用嘅起點係儲備 3 至 6 個月嘅基本開支。增加高波動投資之前，先建立現金緩衝。',
    allocation: '你嘅配置係按照風險程度、投資期限同興趣而設計。先以分散化核心資產為主，再將加密貨幣及主題投資視為可選嘅衛星配置。',
    market: '市場每日都會變動。用市場摘要了解背景，唔好因為短期波動而急住買賣。持續執行計劃通常比捕捉時機更重要。',
    suggestions: ['解釋我嘅資產配置', '我需要幾多應急儲蓄？', '我應唔應該增加加密貨幣？'],
  },
  zh: {
    fallback: '我可以帮助你了解资产配置、应急储蓄、市场主题和下一步。我提供教育性信息，不是个性化财务建议。',
    crypto: '加密货币可以作为小比例的卫星配置，但波动很大。请先准备应急储蓄，不要用短期需要的钱投资。',
    emergency: '一个实用的起点是准备 3 到 6 个月的基本开支。在增加高波动投资前，先建立现金缓冲。',
    allocation: '你的配置是根据风险程度、投资期限和兴趣设计的。先以分散化核心资产为主，再把加密货币和主题投资作为可选的卫星配置。',
    market: '市场每天都会变化。用市场摘要了解背景，不要因为短期波动而急于交易。持续执行计划通常比预测时机更重要。',
    suggestions: ['解释我的资产配置', '我需要多少应急储蓄？', '我应该增加加密货币吗？'],
  },
} as const

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const language: Language = body?.language === 'yue' || body?.language === 'zh' ? body.language : 'en'
    const message = String(body?.message ?? '').toLowerCase()
    const t = copy[language]
    let response = t.fallback
    if (message.includes('crypto') || message.includes('加密') || message.includes('貨幣')) response = t.crypto
    else if (message.includes('emergency') || message.includes('应急') || message.includes('應急')) response = t.emergency
    else if (message.includes('allocation') || message.includes('配置')) response = t.allocation
    else if (message.includes('market') || message.includes('市場') || message.includes('市场')) response = t.market
    return NextResponse.json({ message: response, suggestions: [...t.suggestions] })
  } catch {
    return NextResponse.json({ message: copy.en.fallback, suggestions: [...copy.en.suggestions] }, { status: 200 })
  }
}
