'use client'

import { Shield, Lock, FileText, Zap, Database, GitBranch } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground mb-8">
              Paralegal AI
              <span className="block text-primary mt-2">Privacy-First Summaries</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
              Secure email summarization for law firms. Process privileged communications 
              with private LLMs that never expose sensitive client information to the internet.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/demo" 
                className="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <FileText className="w-5 h-5 mr-2" />
                View Demo
              </Link>
              <Link 
                href="/security" 
                className="inline-flex items-center px-6 py-3 rounded-lg border border-border text-foreground font-medium hover:bg-accent transition-colors"
              >
                <Shield className="w-5 h-5 mr-2" />
                Security Details
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Model Visual */}
      <section className="py-24 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-card-foreground mb-4">Two-Box Privacy Model</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Email content never leaves the private LLM. Optional fact-checking uses 
              redacted, template-based queries only.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Private Box */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-background rounded-2xl p-8 border-2 border-green-500/50"
            >
              <div className="flex items-center mb-6">
                <Lock className="w-8 h-8 text-green-500 mr-3" />
                <h3 className="text-2xl font-bold text-foreground">Private LLM Box</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  All email content processed here
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  No internet egress (network isolated)
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Generates summaries with exact spans
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                  Contract term flagging
                </li>
              </ul>
            </motion.div>

            {/* Bridge */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-background rounded-2xl p-8 border-2 border-blue-500/50"
            >
              <div className="flex items-center mb-6">
                <GitBranch className="w-8 h-8 text-blue-500 mr-3" />
                <h3 className="text-2xl font-bold text-foreground">Bridge (Optional)</h3>
              </div>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Redacts all PII before external queries
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Only allowlisted legal templates
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  512 character query limit
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                  Cryptographic audit logging
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Enterprise-Ready from Day One</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built for law firms with strict compliance requirements and zero tolerance for data exposure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Privacy by Design',
                description: 'No client data ever reaches external APIs. All processing stays within your controlled environment.',
                color: 'text-green-500'
              },
              {
                icon: Database,
                title: 'Deterministic Output',
                description: 'Every bullet point links to exact spans in the original email with byte-offset precision.',
                color: 'text-blue-500'
              },
              {
                icon: Zap,
                title: 'Contract Intelligence',
                description: 'Automatically flags liability caps, indemnity clauses, deadlines, and 11 other contract terms.',
                color: 'text-purple-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="bg-card rounded-xl p-6 border border-border"
              >
                <feature.icon className={`w-10 h-10 ${feature.color} mb-4`} />
                <h3 className="text-xl font-semibold text-card-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-card-foreground">Paralegal AI</h3>
              <p className="text-muted-foreground text-sm">Privacy-first email summarization</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/security" className="text-muted-foreground hover:text-foreground transition-colors">
                Security
              </Link>
              <Link href="/docs" className="text-muted-foreground hover:text-foreground transition-colors">
                Documentation
              </Link>
              <Link href="/deploy" className="text-muted-foreground hover:text-foreground transition-colors">
                Deploy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}