"use client";

import { useState } from "react";
import { meldPilotInteresse } from "@/lib/actions/leads";

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 16px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.08)",
  color: "#ffffff",
  fontSize: 15,
};

export default function PilotInterestForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      await meldPilotInteresse(formData);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <p style={{ color: "#ffffff", fontSize: 16, fontWeight: 600 }}>
        Bedankt! We nemen zo snel mogelijk contact met je op.
      </p>
    );
  }

  return (
    <form
      action={handleSubmit}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
        maxWidth: 640,
        margin: "0 auto",
        textAlign: "left",
      }}
    >
      <input name="naam" placeholder="Naam" style={inputStyle} />
      <input name="organisatie" placeholder="Naam organisatie" style={inputStyle} />
      <input name="email" type="email" required placeholder="E-mailadres" style={inputStyle} />
      <input name="telefoon" placeholder="Telefoon (optioneel)" style={inputStyle} />
      <textarea
        name="bericht"
        placeholder="Vertel kort over jullie situatie (optioneel)"
        rows={3}
        style={{ ...inputStyle, gridColumn: "1 / -1", resize: "vertical" as const }}
      />
      {error && (
        <p style={{ gridColumn: "1 / -1", color: "#ffb4b4", fontSize: 14 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        style={{
          gridColumn: "1 / -1",
          background: "#FFB800",
          color: "#191c1d",
          fontWeight: 700,
          fontSize: 16,
          padding: "14px 36px",
          borderRadius: 100,
          border: "none",
          cursor: loading ? "default" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Bezig..." : "Vraag de pilot aan"}
      </button>
    </form>
  );
}
