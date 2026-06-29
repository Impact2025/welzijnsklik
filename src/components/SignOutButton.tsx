"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface Props {
  className?: string;
}

export default function SignOutButton({ className }: Props) {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={
        className ??
        "text-neutral-500 hover:text-red-600 text-sm transition-colors"
      }
    >
      <LogOut size={15} className="inline mr-1.5 -mt-0.5" />
      Uitloggen
    </button>
  );
}
