import { Loader2 } from "lucide-react";

export default function CoordinatorLoading() {
  return (
    <div className="px-4 py-20 text-center space-y-3">
      <Loader2 size={24} className="animate-spin text-amber-500 mx-auto" />
      <p className="text-sm text-neutral-400 font-medium">Dashboard laden…</p>
    </div>
  );
}
