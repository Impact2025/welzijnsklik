"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { PageHeader } from "@/components/ui";
import RichTextEditor from "@/components/RichTextEditor";

export default function NieuweNieuwsbriefForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inhoud, setInhoud] = useState("");

  async function handleSubmit(formData: FormData) {
    if (!inhoud || inhoud === "<p></p>") {
      setError("Vul de inhoud van de nieuwsbrief in.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/nieuwsbrieven", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Er ging iets mis");
      }

      router.push("/admin/nieuwsbrieven");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Nieuwe nieuwsbrief"
        description="Maak een nieuwsbrief voor je leads en prospects"
      />

      <Card className="max-w-2xl">
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Onderwerp
            </label>
            <input
              type="text"
              name="onderwerp"
              required
              placeholder="Bijv. Maandelijkse update Juni 2026"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Titel
            </label>
            <input
              type="text"
              name="titel"
              required
              placeholder="Belangrijke updates deze maand"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Inhoud
            </label>
            <RichTextEditor
              name="inhoud"
              onChange={setInhoud}
              placeholder="Begin met schrijven — of plak tekst uit Word of Google Docs…"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-900 mb-1">
              Type
            </label>
            <select
              name="type"
              defaultValue="nieuwsbrief"
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="nieuwsbrief">Nieuwsbrief</option>
              <option value="update">Update/bericht</option>
              <option value="herinnering">Herinnering</option>
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <Button type="submit" variant="primary" loading={loading}>
              Opslaan
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
            >
              Annuleren
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
