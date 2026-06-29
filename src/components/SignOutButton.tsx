"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="text-amber-200 hover:text-white text-sm transition"
    >
      Uitloggen
    </button>
  );
}
