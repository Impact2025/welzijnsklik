/**
 * Minimal, XSS-safe markdown → HTML voor nieuwsbrief-tekstblokken.
 * Ondersteunt: **vet**, *cursief*, `code`, [link](url), - lijst, en paragrafen.
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

export function markdownNaarHtml(input: string): string {
  const escaped = escapeHtml(input ?? "");
  const lines = escaped.split(/\r?\n/);
  const out: string[] = [];
  let inList = false;

  const inline = (t: string) =>
    t
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
        '<a href="$1" style="color:#b45309;">$2</a>'
      );

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      continue;
    }
    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        out.push('<ul style="margin:8px 0;padding-left:20px;">');
        inList = true;
      }
      out.push(`<li style="font-size:14px;line-height:1.6;color:#655e54;">${inline(listMatch[1])}</li>`);
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<p style="font-size:14px;line-height:1.6;color:#655e54;margin:0 0 10px;">${inline(line)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("");
}
