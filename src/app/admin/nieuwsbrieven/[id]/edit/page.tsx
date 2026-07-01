"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, PageHeader } from "@/components/ui";
import { Loader2, Save } from "lucide-react";

interface Nieuwsbrief {
  id: string;
  onderwerp: string;
  titel: string;
  inhoud: string;
  doelgroep: string;
  type: string;
  status: string;
}

export default function NieuwsbriefEditPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<Nieuwsbrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/nieuwsbrieven/${params.id}`)
      .then((r) => r.json())
      .then(setItem)
      .catch(() => setError("Kon nieuwsbrief niet laden"));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/admin/nieuwsbrieven/${params.id}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Opslaan mislukt");
      }
      router.push("/admin/nieuwsbrieven");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Onbekende fout");
    } finally {
      setLoading(false);
    }
  }

  if (!item && !error) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-neutral-300" />
      </div>
    );
  }

  if (error && !item) {
    return <div className="p-6"><p className="text-red-600 text-sm">{error}</p></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Nieuwsbrief bewerken"
        description={`Status: ${item!.status}`}
      />
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Onderwerp (e-mailregel)
            </label>
            <input
              name="onderwerp"
              required
              defaultValue={item!.onderwerp}
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">Titel</label>
            <input
              name="titel"
              required
              defaultValue={item!.titel}
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">Inhoud (HTML)</label>
            <textarea
              name="inhoud"
              rows={12}
              required
              defaultValue={item!.inhoud}
              className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-900 mb-1">Doelgroep</label>
              <select
                name="doelgroep"
                defaultValue={item!.doelgroep}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="vrijwilligers">Vrijwilligers</option>
                <option value="familie">Familieleden</option>
                <option value="alle">Iedereen</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-900 mb-1">Type</label>
              <select
                name="type"
                defaultValue={item!.type}
                className="w-full px-3 py-2 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="nieuwsbrief">Nieuwsbrief</option>
                <option value="update">Update/bericht</option>
                <option value="herinnering">Herinnering</option>
              </select>
            </div>
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
              {loading ? "Bezig…" : "Opslaan"}
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
    </div>
  );
}
