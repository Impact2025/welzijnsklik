"use client";

import { useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
} from "lucide-react";

type WrapAction = { kind: "wrap"; before: string; after: string; placeholder: string };
type LinePrefixAction = { kind: "linePrefix"; prefix: string; placeholder: string };
type Action = WrapAction | LinePrefixAction;

const TOOLBAR: { title: string; icon: typeof Bold; action: Action }[] = [
  { title: "Vet", icon: Bold, action: { kind: "wrap", before: "**", after: "**", placeholder: "vetgedrukte tekst" } },
  { title: "Cursief", icon: Italic, action: { kind: "wrap", before: "*", after: "*", placeholder: "cursieve tekst" } },
  { title: "Doorhalen", icon: Strikethrough, action: { kind: "wrap", before: "~~", after: "~~", placeholder: "doorgehaalde tekst" } },
  { title: "Code", icon: Code, action: { kind: "wrap", before: "`", after: "`", placeholder: "code" } },
  { title: "Subkop groot", icon: Heading2, action: { kind: "linePrefix", prefix: "## ", placeholder: "Subkop" } },
  { title: "Subkop klein", icon: Heading3, action: { kind: "linePrefix", prefix: "### ", placeholder: "Subkop" } },
  { title: "Lijst", icon: List, action: { kind: "linePrefix", prefix: "- ", placeholder: "Lijstitem" } },
  { title: "Genummerde lijst", icon: ListOrdered, action: { kind: "linePrefix", prefix: "1. ", placeholder: "Lijstitem" } },
  { title: "Citaat", icon: Quote, action: { kind: "linePrefix", prefix: "> ", placeholder: "Citaat" } },
  { title: "Link", icon: LinkIcon, action: { kind: "wrap", before: "[", after: "](https://)", placeholder: "linktekst" } },
];

export function RichTextField({
  value,
  onChange,
  disabled,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  function applyWrap(a: WrapAction) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = value.slice(start, end) || a.placeholder;
    const next = value.slice(0, start) + a.before + selected + a.after + value.slice(end);
    onChange(next);
    const selStart = start + a.before.length;
    const selEnd = selStart + selected.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  function applyLinePrefix(a: LinePrefixAction) {
    const el = ref.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    let lineEnd = value.indexOf("\n", end);
    if (lineEnd === -1) lineEnd = value.length;

    const block = value.slice(lineStart, lineEnd);
    const lines = block.length > 0 ? block.split("\n") : [""];
    const alreadyPrefixed = lines.every((l) => l.startsWith(a.prefix) || l.trim() === "");
    const newLines = lines.map((l) => {
      if (l.trim() === "") return l;
      return alreadyPrefixed ? l.slice(a.prefix.length) : a.prefix + (l || a.placeholder);
    });
    const newBlock = newLines.join("\n");
    const next = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
    onChange(next);
    const selStart = lineStart;
    const selEnd = lineStart + newBlock.length;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  return (
    <div className={`rounded-lg border border-warm-200 overflow-hidden ${disabled ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-0.5 px-1.5 py-1 bg-warm-50 border-b border-warm-200">
        {TOOLBAR.map(({ title, icon: Icon, action }) => (
          <button
            key={title}
            type="button"
            title={title}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (action.kind === "wrap" ? applyWrap(action) : applyLinePrefix(action))}
            className="p-1.5 rounded-md text-warm-500 hover:bg-white hover:text-brand-600 transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
      <textarea
        ref={ref}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-1.5 text-sm focus:outline-none disabled:bg-warm-50 resize-y"
      />
    </div>
  );
}
