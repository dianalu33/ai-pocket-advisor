import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Pocket Advisor — Personal investing clarity',
  description: 'AI Pocket Advisor turns your financial picture into clear, educational investment insights.',
  generator: 'AI Pocket Advisor',
  icons: { icon: '/aurum-ai-logo.svg' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#102b40',
  userScalable: true,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className="bg-background"><body className="antialiased">{children}{process.env.NODE_ENV === 'production' && <Analytics />}</body></html>
}
