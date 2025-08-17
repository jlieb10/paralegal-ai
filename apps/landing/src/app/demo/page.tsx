'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Link as LinkIcon } from 'lucide-react'
import Link from 'next/link'

// Mock data for demo
const mockSummary = {
  email_id: "demo-email-123",
  summary_bullets: [
    {
      text: "Counterparty proposes reducing liability cap to 1x fees under the agreement.",
      spans: [{ start: 1532, end: 1598 }],
      anchors: ["#para-12"]
    },
    {
      text: "Client requests execution by August 30, 2025 to meet project deadline.",
      spans: [{ start: 2201, end: 2219 }],
      anchors: ["#date-aug-30"]
    },
    {
      text: "Indemnification clause on page 12 requires review for excessive exposure.",
      spans: [{ start: 2850, end: 2920 }],
      anchors: ["#para-18"]
    },
    {
      text: "Governing law specified as New York with venue in Manhattan courts.",
      spans: [{ start: 3201, end: 3280 }],
      anchors: ["#para-22"]
    }
  ],
  flags: [
    {
      type: "LIABILITY_CAP",
      term: "1x fees",
      severity: "HIGH",
      rationale: "Liability limitation clause requires review for adequacy",
      spans: [{ start: 1532, end: 1598 }],
      anchors: ["#para-12"]
    },
    {
      type: "DATE_DEADLINE", 
      date: "2025-08-30",
      severity: "MEDIUM",
      rationale: "Critical deadline requires calendar tracking and compliance",
      spans: [{ start: 2201, end: 2219 }],
      anchors: ["#date-aug-30"]
    },
    {
      type: "INDEMNITY",
      severity: "HIGH", 
      rationale: "Indemnification provision may create significant risk exposure",
      spans: [{ start: 2850, end: 2920 }],
      anchors: ["#para-18"]
    }
  ]
}

const mockEmail = `Dear Counsel,

I am writing to follow up on our contract negotiations for the software licensing agreement. After reviewing the latest draft, I have several concerns that need to be addressed before we can proceed.

First, regarding the liability provisions in Section 12, we cannot accept the proposed liability cap of 1x the fees paid under this agreement. Our client requires adequate protection given the critical nature of the software implementation. We propose maintaining the current cap at 3x fees or establishing a separate cap for data breach incidents.

Please note that we need execution by August 30, 2025 to meet the project implementation deadline. Any delays beyond this date will impact the client's Q4 rollout schedule and may require renegotiation of the timeline provisions.

The indemnification clause on page 12 also requires discussion, as it may create excessive exposure for our client. The current language extends beyond typical software licensing scenarios and includes broad third-party claims coverage. We suggest limiting this to intellectual property infringement claims directly related to the licensed software.

Finally, the governing law and venue provisions specify New York law with exclusive jurisdiction in Manhattan courts. While this is acceptable, we want to confirm the dispute resolution process includes mandatory mediation before litigation.

I look forward to your response on these points. Please let me know your availability for a call this week to discuss these terms in detail.

Best regards,
Sarah Johnson
Partner, Johnson & Associates
sarah.johnson@johnsonlaw.com
Direct: (555) 123-4567`

export default function DemoPage() {
  const [activeSection, setActiveSection] = useState<'summary' | 'email'>('summary')
  const [highlightedSpan, setHighlightedSpan] = useState<number | null>(null)

  const scrollToSpan = (spanStart: number) => {
    setActiveSection('email')
    setHighlightedSpan(spanStart)
    // In a real implementation, this would scroll to the exact position
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-card-foreground">
              Paralegal AI
            </Link>
            <Link 
              href="/" 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground mb-4">Live Demo</h1>
          <p className="text-muted-foreground">
            Interactive demonstration of privacy-first email summarization with linked spans.
          </p>
        </motion.div>

        {/* Section Toggle */}
        <div className="flex space-x-1 bg-muted rounded-lg p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveSection('summary')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeSection === 'summary' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            AI Summary
          </button>
          <button
            onClick={() => setActiveSection('email')}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              activeSection === 'email' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Original Email
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Summary Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className={`${activeSection === 'summary' ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Summary Bullets
              </h2>
              
              <div className="space-y-4 mb-8">
                {mockSummary.summary_bullets.map((bullet, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-card-foreground">{bullet.text}</p>
                      <button
                        onClick={() => scrollToSpan(bullet.spans[0].start)}
                        className="inline-flex items-center text-sm text-primary hover:text-primary/80 mt-1"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        Link to source
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Contract Flags */}
              <h3 className="text-lg font-semibold text-card-foreground mb-4">Contract Flags</h3>
              <div className="space-y-3">
                {mockSummary.flags.map((flag, index) => (
                  <div key={index} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-card-foreground">
                        {flag.type.replace('_', ' ')}
                        {flag.term && `: ${flag.term}`}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium border rounded-full ${getSeverityColor(flag.severity)}`}>
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{flag.rationale}</p>
                    <button
                      onClick={() => scrollToSpan(flag.spans[0].start)}
                      className="inline-flex items-center text-sm text-primary hover:text-primary/80"
                    >
                      <LinkIcon className="w-3 h-3 mr-1" />
                      View in email
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Email Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={`${activeSection === 'email' ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <div className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold text-card-foreground mb-6">Original Email</h2>
              <div className="bg-muted rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed font-mono">
                  {mockEmail}
                </pre>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                <p>📧 In a real deployment:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Clicking 🔗 links scrolls to exact text spans</li>
                  <li>HTML anchors provide stable reference points</li>
                  <li>Byte-offset precision ensures accuracy</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Privacy Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-green-800 mb-2">🔒 Privacy Guarantee</h3>
          <p className="text-green-700">
            This demo uses mock data. In production, no email content ever reaches external APIs. 
            All processing happens in your private, network-isolated LLM environment.
          </p>
        </motion.div>
      </div>
    </div>
  )
}