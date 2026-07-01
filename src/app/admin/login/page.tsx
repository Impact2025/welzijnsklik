"use client";

import { useState } from "react";
import { Card } from "@/components/ui";
import { Lock, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("v.munster@weareimpact.nl");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      window.location.href = "/admin";
    } else {
      const data = await res.json();
      setError(data.error || "Login mislukt");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50">
      <Card className="w-full max-w-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center">
            <Lock size={20} className="text-brand-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wachtwoord
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
          >
            <LogIn size={16} />
            {loading ? "Bezig..." : "Inloggen"}
          </button>
        </form>
      </Card>
    </div>
  );
}
