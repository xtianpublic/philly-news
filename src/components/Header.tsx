"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface HeaderProps {
  lastUpdated: string;
}

export function Header({ lastUpdated }: HeaderProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const date = new Date(lastUpdated);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 1500);
  };

  return (
    <header className="mb-12 pt-8 md:pt-12">
      <div className="text-center mb-8">
        <h1 className="font-sans font-black text-4xl md:text-5xl lg:text-6xl tracking-tight mb-2">
          <span style={{ color: "#004C54" }}>Philly</span> Morning Bulletin
        </h1>
        <p className="font-serif text-muted text-lg italic">
          Your daily briefing on Philadelphia news
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 text-sm text-muted border-y border-border py-3">
        <time dateTime={lastUpdated}>{formattedDate}</time>
        <span>·</span>
        <span>Updated {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
        <span>·</span>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="font-bold hover:underline disabled:opacity-50"
          style={{ color: "#004C54" }}
        >
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </header>
  );
}
