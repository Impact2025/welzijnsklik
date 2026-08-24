/**
 * Minimal, XSS-safe markdown → HTML voor nieuwsbrief-tekstblokken.
 * Ondersteunt: **vet**, *cursief*, ~~doorhalen~~, `code`, [link](url),
 * ## / ### koppen, - lijst, 1. genummerde lijst, > citaat, en paragrafen.
 * Alle gebruikersinput wordt eerst ge-escaped; alleen de door ons gegenereerde
 * tags worden teruggeplaatst. Geen raw HTML van de gebruiker komt in de mail.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const inline = (t: string) =>
  t
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/~~([^~]+)~~/g, "<s>$1</s>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$1" style="color:#b45309;">$2</a>'
    );

export function markdownNaarHtml(input: string): string {
  const escaped = escapeHtml(input ?? "");
  const lines = escaped.split(/\r?\n/);
  const out: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let inQuote = false;

  const closeList = () => {
    if (listType) {
      out.push(listType === "ul" ? "</ul>" : "</ol>");
      listType = null;
    }
  };
  const closeQuote = () => {
    if (inQuote) {
      out.push("</blockquote>");
      inQuote = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      closeQuote();
      continue;
    }

    const h2Match = line.match(/^##\s+(.*)$/);
    const h3Match = line.match(/^###\s+(.*)$/);
    const quoteMatch = line.match(/^&gt;\s?(.*)$/);
    const ulMatch = line.match(/^[-*]\s+(.*)$/);
    const olMatch = line.match(/^\d+\.\s+(.*)$/);

    if (h2Match) {
      closeList();
      closeQuote();
      out.push(`<h2 style="font-size:16px;font-weight:700;margin:14px 0 6px;color:#1a1714;">${inline(h2Match[1])}</h2>`);
    } else if (h3Match) {
      closeList();
      closeQuote();
      out.push(`<h3 style="font-size:15px;font-weight:700;margin:12px 0 4px;color:#1a1714;">${inline(h3Match[1])}</h3>`);
    } else if (quoteMatch) {
      closeList();
      if (!inQuote) {
        out.push('<blockquote style="margin:8px 0;padding:2px 14px;border-left:3px solid #e7cba4;color:#817a6e;font-style:italic;">');
        inQuote = true;
      }
      out.push(`<p style="font-size:14px;line-height:1.6;margin:0;">${inline(quoteMatch[1])}</p>`);
    } else if (ulMatch) {
      closeQuote();
      if (listType !== "ul") {
        closeList();
        out.push('<ul style="margin:8px 0;padding-left:20px;list-style:disc;">');
        listType = "ul";
      }
      out.push(`<li style="display:list-item;font-size:14px;line-height:1.6;color:#655e54;">${inline(ulMatch[1])}</li>`);
    } else if (olMatch) {
      closeQuote();
      if (listType !== "ol") {
        closeList();
        out.push('<ol style="margin:8px 0;padding-left:20px;list-style:decimal;">');
        listType = "ol";
      }
      out.push(`<li style="display:list-item;font-size:14px;line-height:1.6;color:#655e54;">${inline(olMatch[1])}</li>`);
    } else {
      closeList();
      closeQuote();
      out.push(`<p style="font-size:14px;line-height:1.6;color:#655e54;margin:0 0 10px;">${inline(line)}</p>`);
    }
  }
  closeList();
  closeQuote();
  return out.join("");
}
