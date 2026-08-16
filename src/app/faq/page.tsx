import Link from 'next/link'
import type { Metadata } from 'next'
import { faqPageSchema, breadcrumbSchema } from '@/lib/seo-kit'

export const metadata: Metadata = {
  title: 'Veelgestelde vragen — Welzijnsklik',
  description:
    'Antwoorden op veelgestelde vragen over Welzijnsklik: welzijn voor zorgorganisaties, aanmelden, sectoren en ondersteuning.',
  alternates: { canonical: '/faq' },
  openGraph: { title: 'Veelgestelde vragen — Welzijnsklik', url: '/faq' },
}

const APP_URL = 'https://welzijnsklik.nl'

const FAQ = [
  {
    question: 'Wat is Welzijnsklik?',
    answer:
      'Welzijnsklik is een platform dat welzijn en verbinding binnen zorgorganisaties en gemeenschappen ondersteunt.',
  },
  {
    question: 'Voor welke organisaties is Welzijnsklik?',
    answer: 'Voor zorgorganisaties, welzijnsinstellingen en gemeenten die welzijn meetbaar en verbindend maken.',
  },
  {
    question: 'Hoe start ik met Welzijnsklik?',
    answer: 'Meld je organisatie aan, kies je sectoren en doorloop de korte onboarding voor teams en vrijwilligers.',
  },
  {
    question: 'Werken jullie met pilots?',
    answer: 'Ja, organisaties kunnen starten met een pilot om Welzijnsklik in de eigen praktijk te ervaren.',
  },
  {
    question: 'Is er ondersteuning beschikbaar?',
    answer: 'Ja, via het support-kanaal en de beheerdersomgeving vind je hulp en documentatie.',
  },
]

export default function FaqPage() {
  const jsonLd = [
    faqPageSchema(FAQ),
    breadcrumbSchema([
      { name: 'Home', url: `${APP_URL}/` },
      { name: 'FAQ', url: `${APP_URL}/faq` },
    ]),
  ]
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      {jsonLd.map((s, idx) => (
        <script key={idx} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:underline">Home</Link> / <span>FAQ</span>
      </nav>
      <h1 className="text-3xl font-bold mb-2">Veelgestelde vragen</h1>
      <p className="text-muted-foreground mb-8">Korte, feitelijke antwoorden — direct citeerbaar voor AI-zoekresultaten.</p>
      <div className="divide-y border rounded-lg">
        {FAQ.map((it, i) => (
          <details key={i} className="p-4">
            <summary className="cursor-pointer font-medium">{it.question}</summary>
            <p className="mt-2 text-muted-foreground">{it.answer}</p>
          </details>
        ))}
      </div>
    </main>
  )
}
