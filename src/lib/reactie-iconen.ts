import { Heart, Smile, ThumbsUp, PartyPopper, Frown, Hand, Flame, Laugh, type LucideIcon } from "lucide-react";

export const REACTIES: { id: string; icon: LucideIcon; label: string }[] = [
  { id: "hart", icon: Heart, label: "Vind ik leuk" },
  { id: "blij", icon: Smile, label: "Blij" },
  { id: "duim", icon: ThumbsUp, label: "Duim omhoog" },
  { id: "gejuich", icon: PartyPopper, label: "Gejuich" },
  { id: "verdriet", icon: Frown, label: "Verdrietig" },
  { id: "dank", icon: Hand, label: "Dank je wel" },
  { id: "vuur", icon: Flame, label: "Top" },
  { id: "lach", icon: Laugh, label: "Grappig" },
];

export function reactieIcon(id: string): LucideIcon | null {
  return REACTIES.find((r) => r.id === id)?.icon ?? null;
}
