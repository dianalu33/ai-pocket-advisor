import { NextResponse } from 'next/server'

let cached: { at: number; data: unknown } | null = null
const fallback = { pulse: [{ name: 'S&P 500', value: '5,842.11', change: '+0.68%', tone: 'up' }, { name: 'NASDAQ', value: '18,912.44', change: '+1.12%', tone: 'up' }, { name: 'Bitcoin', value: '$104,260', change: '+2.41%', tone: 'up' }, { name: '10Y Treasury', value: '4.21%', change: '-0.04%', tone: 'down' }], assets: [{ name: 'Bitcoin', symbol: 'BTC', price: '$104,260', change: '+2.41%', tone: 'up' }, { name: 'Ethereum', symbol: 'ETH', price: '$3,812', change: '+1.88%', tone: 'up' }, { name: 'S&P 500 ETF', symbol: 'VOO', price: '$538.22', change: '+0.68%', tone: 'up' }, { name: 'US Bond ETF', symbol: 'BND', price: '$73.10', change: '-0.12%', tone: 'down' }], trending: ['AI infrastructure', 'Tokenized treasuries', 'Quality dividends', 'Emerging markets'], news: [{ title: 'Markets weigh cooling inflation against resilient growth', source: 'Market Brief', time: '18 min ago', tag: 'Macro' }, { title: 'Bitcoin liquidity improves as institutional demand returns', source: 'Digital Assets Daily', time: '42 min ago', tag: 'Crypto' }, { title: 'Treasury yields dip as investors rotate toward quality', source: 'The Financial Wire', time: '1 hr ago', tag: 'Bonds' }] }

export async function GET(request: Request) {
  const refresh = new URL(request.url).searchParams.get('refresh') === '1'
  if (!refresh && cached && Date.now() - cached.at < 120000) return NextResponse.json(cached.data)
  let data = { ...fallback, isFallback: true }
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true', { next: { revalidate: 120 } })
    if (response.ok) {
      const crypto = await response.json()
      data = { ...fallback, isFallback: false, assets: fallback.assets.map((asset) => asset.symbol === 'BTC' ? { ...asset, price: `$${Math.round(crypto.bitcoin.usd).toLocaleString()}`, change: `${crypto.bitcoin.usd_24h_change >= 0 ? '+' : ''}${crypto.bitcoin.usd_24h_change.toFixed(2)}%` } : asset.symbol === 'ETH' ? { ...asset, price: `$${Math.round(crypto.ethereum.usd).toLocaleString()}`, change: `${crypto.ethereum.usd_24h_change >= 0 ? '+' : ''}${crypto.ethereum.usd_24h_change.toFixed(2)}%` } : asset) }
    }
  } catch { /* fallback keeps the demo useful when public APIs rate-limit */ }
  cached = { at: Date.now(), data }
  return NextResponse.json(data)
}
