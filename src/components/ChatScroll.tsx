"use client";

import { useEffect, useRef } from "react";

export default function ChatScroll({ children }: { children: React.ReactNode }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  return (
    <>
      {children}
      <div ref={bottomRef} />
    </>
  );
}
