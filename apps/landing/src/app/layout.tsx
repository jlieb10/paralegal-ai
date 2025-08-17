import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Paralegal AI - Privacy-First Email Summarization',
  description: 'Secure, private email summarization for law firms. Process client communications without exposing sensitive information.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans">{children}</body>
    </html>
  )
}