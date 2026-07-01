"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import { Loader2, Sparkles, Save, Eye, Globe } from "lucide-react";

interface BlogPost {
  id: string;
  titel: string;
  slug: string;
  inhoud: string;
  samenvatting: string | null;
  focusKeyword: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  status: string;
  tags: { tag: { naam: string } }[];
}

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [inhoud, setInhoud] = useState("");

  useEffect(() => {
    fetch(`/api/admin/blog/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setPost(data);
        setInhoud(data.inhoud ?? "");
      })
      .catch(() => setError("Kon blogpost niet laden"));
  }, [params.id]);

  async function handleAIContent() {
    if (!post) return;
    setAiLoading(true);
    try {
      const data = await fetch("/api/admin/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Verbeter of herschrijf de volgende blogpost: "${post.titel}". Behoud de hoofdboodschap maar maak de tekst vlotter en professioneler.`,
        }),
      }).then((r) => r.json());
      if (data.content) setInhoud(data.content);
    } catch {
      setError("AI generatie mislukt");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>, publish?: boolean) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("inhoud", inhoud);
    if (publish !== undefined) formData.set("publish", String(publish));

    try {
      const res = await fetch(`/api/admin/blog/${params.id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Opslaan mislukt");
      }
      router.push("/admin/blog");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  if (!post && !error) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-neutral-300" />
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="p-6">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Blogpost bewerken"
        description={post!.status === "GEPUBLICEERD" ? "Gepubliceerd" : "Concept"}
        action={
          <button
            onClick={() => setPreview(!preview)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-warm-200 text-sm font-medium hover:bg-warm-50 transition-colors"
          >
            <Eye size={15} />
            {preview ? "Editor" : "Preview"}
          </button>
        }
      />

      {preview ? (
        <Card className="max-w-3xl prose prose-sm max-w-none">
          <h1 className="text-2xl font-bold">{post!.titel}</h1>
          <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{inhoud}</div>
        </Card>
      ) : (
        <Card className="max-w-4xl">
          <form
            onSubmit={(e) => handleSubmit(e)}
            id="blog-form"
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-warm-900 mb-1">Titel</label>
              <input
                name="titel"
                required
                defaultValue={post!.titel}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-900 mb-1">Slug (URL)</label>
              <input
                name="slug"
                required
                defaultValue={post!.slug}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-warm-900">Inhoud (markdown)</label>
                <button
                  type="button"
                  onClick={handleAIContent}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                  AI verbeteren
                </button>
              </div>
              <textarea
                value={inhoud}
                onChange={(e) => setInhoud(e.target.value)}
                rows={16}
                required
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-900 mb-1">Samenvatting</label>
              <textarea
                name="samenvatting"
                rows={2}
                defaultValue={post!.samenvatting ?? ""}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-warm-900 mb-1">SEO titel</label>
                <input
                  name="seoTitle"
                  defaultValue={post!.seoTitle ?? ""}
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warm-900 mb-1">Focus keyword</label>
                <input
                  name="focusKeyword"
                  defaultValue={post!.focusKeyword ?? ""}
                  className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-900 mb-1">SEO beschrijving</label>
              <textarea
                name="seoDescription"
                rows={2}
                defaultValue={post!.seoDescription ?? ""}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl font-semibold text-sm hover:bg-brand-600 transition-colors disabled:opacity-60"
              >
                <Save size={15} />
                {loading ? "Bezig…" : "Concept opslaan"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  const form = document.getElementById("blog-form") as HTMLFormElement;
                  const syntheticEvent = { currentTarget: form, preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
                  handleSubmit(syntheticEvent, true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600 transition-colors disabled:opacity-60"
              >
                <Globe size={15} />
                Publiceren
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
