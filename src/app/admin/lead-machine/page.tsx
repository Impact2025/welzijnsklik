'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search, Star, StarOff, Download, ExternalLink, Mail, Phone,
  MapPin, Zap, Loader2, Trash2, CheckCircle2, RefreshCw,
  Database, TrendingUp, Settings2, ChevronDown, ChevronUp, Clock,
  ArrowRight, Building2, UserPlus, Users,
} from 'lucide-react';
import { Card, PageHeader, Badge, Button, EmptyState } from '@/components/ui';

// ── Types ──────────────────────────────────────────────────────────────────

interface SearchResultItem {
  kvkNumber: string;
  name: string;
  website?: string;
  email?: string;
  phone?: string;
  aiScore?: number;
  aiRationale?: string;
  alreadySaved?: boolean;
  sbiDescription?: string;
}

interface SavedLead {
  id: string;
  naam: string | null;
  organisatie: string | null;
  email: string;
  telefoon: string | null;
  website: string | null;
  plaats: string | null;
  aiScore: number | null;
  aiRationale: string | null;
  sbiBeschrijving: string | null;
  status: string;
  starred: boolean;
  createdAt: string;
}

// ── Score badge ─────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score?: number | null }) {
  if (score == null) return <span className="text-xs text-neutral-300">–</span>;
  const color =
    score >= 8
      ? 'bg-emerald-100 text-emerald-700'
      : score >= 5
        ? 'bg-amber-100 text-amber-700'
        : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>
      {score}/10
    </span>
  );
}

// ── Status badge ────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info' }> = {
  nieuw: { label: 'Nieuw', variant: 'info' },
  benaderd: { label: 'Benaderd', variant: 'warning' },
  klant: { label: 'Klant', variant: 'success' },
  niet_relevant: { label: 'Niet relevant', variant: 'default' },
};

// ── Loading steps ──────────────────────────────────────────────────────────

const LOAD_STEPS = [
  'Organisaties zoeken via het web...',
  'Websites bezoeken voor contactgegevens...',
  'AI-score berekenen per organisatie...',
  'Resultaten sorteren op relevantie...',
];

// ── Search form ─────────────────────────────────────────────────────────────

function SearchForm({ onResults }: { onResults: (results: SearchResultItem[]) => void }) {
  const [query, setQuery] = useState('');
  const [maxResults, setMaxResults] = useState('10');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => setStep((s) => (s + 1) % LOAD_STEPS.length), 4000);
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setStep(0);
    try {
      const res = await fetch('/api/admin/lead-machine/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery.trim(), maxResults: Number(maxResults) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Onbekende fout');
      onResults(data.results ?? []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card padding="lg">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            placeholder="bijv. woonzorgcentra Amsterdam"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !loading && handleSearch()}
            className="flex-1 px-3 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Woonzorg Amsterdam', q: 'woonzorgcentra Amsterdam' },
            { label: 'Verpleeghuizen Utrecht', q: 'verpleeghuizen Utrecht' },
            { label: 'Thuiszorg Rotterdam', q: 'thuiszorgorganisaties Rotterdam' },
            { label: 'Welzijnsstichtingen', q: 'welzijnsstichtingen Nederland' },
            { label: 'Gemeenten sociaal', q: 'gemeenten sociaal domein' },
          ].map((p) => (
            <button
              key={p.q}
              onClick={() => { setQuery(p.q); handleSearch(p.q); }}
              disabled={loading}
              className="px-2.5 py-1 text-xs bg-neutral-100 hover:bg-amber-100 hover:text-amber-700 rounded-full transition-colors disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Aantal */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-neutral-700">Aantal:</label>
          <select
            value={maxResults}
            onChange={(e) => setMaxResults(e.target.value)}
            className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="10">10 (~15s)</option>
            <option value="20">20 (~25s)</option>
            <option value="30">30 (~40s)</option>
          </select>
        </div>

        <Button onClick={() => handleSearch()} disabled={loading || !query.trim()} fullWidth icon={loading ? undefined : Zap}>
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />{LOAD_STEPS[step]}</>
          ) : (
            'Analyseren'
          )}
        </Button>

        {loading && (
          <p className="text-xs text-neutral-400 text-center">
            Websites worden live bezocht — dit duurt ~15-40 seconden
          </p>
        )}
      </div>
    </Card>
  );
}

// ── Results table ───────────────────────────────────────────────────────────

function ResultsTable({ results, onSaved }: { results: SearchResultItem[]; onSaved: () => void }) {
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(
    new Set(results.filter((r) => r.alreadySaved).map((r) => r.kvkNumber)),
  );
  const [expanded, setExpanded] = useState<string | null>(null);

  const saveLead = async (r: SearchResultItem) => {
    setSaving((s) => new Set(s).add(r.kvkNumber));
    try {
      const res = await fetch('/api/admin/lead-machine/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organisatie: r.name,
          website: r.website,
          email: r.email,
          telefoon: r.phone,
          aiScore: r.aiScore,
          aiRationale: r.aiRationale,
          sbiDescription: r.sbiDescription,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved((s) => new Set(s).add(r.kvkNumber));
      onSaved();
    } catch {
      console.error('Save failed');
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(r.kvkNumber); return n; });
    }
  };

  const saveHighScoring = async () => {
    const toSave = results.filter((r) => !saved.has(r.kvkNumber) && (r.aiScore ?? 0) >= 6);
    for (const r of toSave) await saveLead(r);
  };

  if (results.length === 0) return null;

  const withEmail = results.filter((r) => r.email).length;
  const avgScore = (results.reduce((sum, r) => sum + (r.aiScore ?? 0), 0) / results.length).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <span className="text-neutral-600"><strong>{results.length}</strong> gevonden</span>
        <span className="text-neutral-600"><strong>{withEmail}</strong> met e-mail</span>
        <span className="text-neutral-600">Gem. score <strong>{avgScore}</strong></span>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={saveHighScoring} icon={Database}>
            Sla score &ge;6 op
          </Button>
          <a
            href="/api/admin/lead-machine/export"
            download
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <Download size={14} />
            CSV
          </a>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-100 bg-white overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase w-16">Score</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase">Organisatie</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase hidden lg:table-cell">Contact</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-neutral-500 uppercase hidden md:table-cell w-28">Website</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-neutral-500 uppercase w-24">Actie</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <>
                <tr
                  key={r.kvkNumber}
                  className="border-b border-neutral-50 cursor-pointer hover:bg-amber-50/50 transition-colors"
                  onClick={() => setExpanded(expanded === r.kvkNumber ? null : r.kvkNumber)}
                >
                  <td className="px-4 py-3"><ScoreBadge score={r.aiScore} /></td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900 leading-tight">{r.name}</div>
                    {r.sbiDescription && (
                      <div className="text-xs text-neutral-400 mt-0.5 line-clamp-1">{r.sbiDescription}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {r.email ? (
                      <a href={`mailto:${r.email}`} className="text-brand-600 hover:underline text-sm" onClick={(e) => e.stopPropagation()}>
                        {r.email}
                      </a>
                    ) : r.phone ? (
                      <a href={`tel:${r.phone}`} className="text-neutral-600 text-sm" onClick={(e) => e.stopPropagation()}>
                        {r.phone}
                      </a>
                    ) : (
                      <span className="text-neutral-300 text-sm">–</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {r.website && (
                      <a
                        href={r.website.startsWith('http') ? r.website : `https://${r.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-gray-800 truncate max-w-[110px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink size={12} className="shrink-0" />
                        {r.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {saved.has(r.kvkNumber) ? (
                      <span className="text-xs text-emerald-600 flex items-center justify-end gap-1 font-medium">
                        <CheckCircle2 size={13} /> Opgeslagen
                      </span>
                    ) : (
                      <button
                        disabled={saving.has(r.kvkNumber)}
                        onClick={(e) => { e.stopPropagation(); saveLead(r); }}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-brand-500 hover:text-white hover:border-brand-500 transition-colors disabled:opacity-50"
                      >
                        {saving.has(r.kvkNumber) ? <span className="w-3 h-3 border-2 border-brand-300 border-t-brand-500 rounded-full animate-spin inline-block" /> : 'Opslaan'}
                      </button>
                    )}
                  </td>
                </tr>
                {expanded === r.kvkNumber && (
                  <tr key={`${r.kvkNumber}-exp`} className="bg-amber-50/70">
                    <td colSpan={5} className="px-4 py-3">
                      <div className="space-y-2 text-sm">
                        {r.aiRationale && (
                          <p className="text-neutral-600 italic">{r.aiRationale}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
                          {r.email && <span className="flex items-center gap-1"><Mail size={11} />{r.email}</span>}
                          {r.phone && <span className="flex items-center gap-1"><Phone size={11} />{r.phone}</span>}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Saved leads ─────────────────────────────────────────────────────────────

function SavedLeads({ refreshKey }: { refreshKey: number }) {
  const [leads, setLeads] = useState<SavedLead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ limit: '50' });
      if (search) qs.set('search', search);
      if (statusFilter !== 'all') qs.set('status', statusFilter);
      const res = await fetch(`/api/admin/lead-machine/leads?${qs}`);
      const data = await res.json();
      setLeads(data.leads ?? []);
      setTotal(data.total ?? 0);
    } catch {
      console.error('Fetch leads failed');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads, refreshKey]);

  const updateStatus = async (id: string, status: string) => {
    await fetch('/api/admin/lead-machine/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  };

  const toggleStar = async (lead: SavedLead) => {
    await fetch('/api/admin/lead-machine/leads', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: lead.id, starred: !lead.starred }),
    });
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, starred: !l.starred } : l));
  };

  const deleteLead = async (id: string) => {
    await fetch(`/api/admin/lead-machine/leads?id=${id}`, { method: 'DELETE' });
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setTotal((t) => t - 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input
          placeholder="Zoeken op naam, plaats of e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-neutral-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="all">Alle statussen</option>
          <option value="nieuw">Nieuw</option>
          <option value="benaderd">Benaderd</option>
          <option value="klant">Klant</option>
          <option value="niet_relevant">Niet relevant</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="w-6 h-6 border-2 border-neutral-200 border-t-brand-500 rounded-full animate-spin" /></div>
      ) : leads.length === 0 ? (
        <EmptyState icon={Users} title="Nog geen leads" description="Zoek naar organisaties via de Lead Machine en sla ze op." />
      ) : (
        <div className="space-y-2">
          {leads.map((lead) => {
            const meta = STATUS_META[lead.status] ?? STATUS_META.nieuw;
            return (
              <Card key={lead.id} padding="md" hover>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleStar(lead)} className="text-neutral-300 hover:text-amber-500 transition-colors">
                        {lead.starred ? <Star size={14} className="text-amber-500 fill-amber-500" /> : <StarOff size={14} />}
                      </button>
                      <h3 className="font-semibold text-gray-900 truncate">{lead.organisatie ?? lead.email}</h3>
                      <ScoreBadge score={lead.aiScore} />
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </div>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      {lead.email}
                      {lead.telefoon && <span> · {lead.telefoon}</span>}
                      {lead.plaats && <span> · {lead.plaats}</span>}
                    </p>
                    {lead.aiRationale && (
                      <p className="text-xs text-neutral-400 mt-1 italic line-clamp-1">{lead.aiRationale}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {lead.website && (
                      <a href={lead.website} target="_blank" rel="noopener" className="p-1.5 text-neutral-300 hover:text-neutral-600">
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <select
                      value={lead.status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="nieuw">Nieuw</option>
                      <option value="benaderd">Benaderd</option>
                      <option value="klant">Klant</option>
                      <option value="niet_relevant">Niet relevant</option>
                    </select>
                    <button onClick={() => deleteLead(lead.id)} className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────

export default function LeadMachinePage() {
  const [tab, setTab] = useState<'search' | 'saved'>('search');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [savedRefreshKey, setSavedRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Lead Machine"
        description="Vind en beoordeel woonzorg- en welzijnsorganisaties met AI"
      />

      {/* Tab navigation */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setTab('search')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'search' ? 'bg-white shadow-sm text-brand-700' : 'text-neutral-500 hover:text-neutral-700'}`}
        >
          <Zap size={14} className="inline mr-1.5" />
          Zoeken
        </button>
        <button
          onClick={() => setTab('saved')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'saved' ? 'bg-white shadow-sm text-brand-700' : 'text-neutral-500 hover:text-neutral-700'}`}
        >
          <Database size={14} className="inline mr-1.5" />
          Opgeslagen
          
        </button>
      </div>

      {tab === 'search' ? (
        <div className="space-y-6">
          <SearchForm onResults={setSearchResults} />
          {searchResults.length > 0 && (
            <ResultsTable results={searchResults} onSaved={() => setSavedRefreshKey((k) => k + 1)} />
          )}
        </div>
      ) : (
        <SavedLeads refreshKey={savedRefreshKey} />
      )}
    </div>
  );
}
