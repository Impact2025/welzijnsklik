"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { PageHeader } from "@/components/ui";
import { Loader2, Sparkles, Save } from "lucide-react";

export default function NieuweBlogPostForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAIContent() {
    setAiLoading(true);
    try {
      const content = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Schrijf een blogpost over het belang van vrijwilligerswerk in de ouderenzorg. Begin met een inleiding, deel in 3 delen, eindig met een oproep tot actie.",
        }),
      }).then(r => r.json()).then(d => d.content);
      
      const inhoudEl = document.getElementById("inhoud") as HTMLTextAreaElement;
      if (inhoudEl) inhoudEl.value = content;
    } catch (err: any) {
      setError(err.message || "AI content generatie mislukt");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Er ging iets mis");
      }

      router.push("/admin/blog");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Nieuwe blog post"
        description="Schrijf een nieuwe post met AI-gestuunde SEO optimalisatie"
      />

      <Card className="max-w-4xl">
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Titel
            </label>
            <input
              id="titel"
              type="text"
              name="titel"
              required
              placeholder="Bijv. Hoe vrijwilligers het leven van ouderen verlichten"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Slug (URL)
            </label>
            <input
              type="text"
              name="slug"
              required
              placeholder="hoe-vrijwilligers-leden-verlichten"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-warm-900">
                Inhoud (markdown)
              </label>
              <button
                type="button"
                onClick={handleAIContent}
                disabled={aiLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                AI genereren
              </button>
            </div>
            <textarea
              id="inhoud"
              name="inhoud"
              rows={15}
              required
              placeholder="# Inhoud..."
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Samenvatting
            </label>
            <textarea
              name="samenvatting"
              rows={3}
              placeholder="Korte samenvatting..."
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Tags (comma-gescheiden)
            </label>
            <input
              type="text"
              name="tags"
              placeholder="vrijwilligers, ouderenzorg, impact"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Focus keyword
            </label>
            <input
              type="text"
              name="focusKeyword"
              placeholder="Bijv. vrijwilligers ouderenzorg"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="primary" loading={loading}>
              <Save size={16} />
              Opslaan
            </Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Annuleren
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
