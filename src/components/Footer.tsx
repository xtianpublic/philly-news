export function Footer() {
  return (
    <footer className="mt-16 py-8 border-t border-border text-center text-sm text-muted">
      <p className="mb-2">
        Aggregating news from{" "}
        <span className="text-foreground">NBC10</span>,{" "}
        <span className="text-foreground">6ABC</span>,{" "}
        <span className="text-foreground">WHYY</span>,{" "}
        <span className="text-foreground">Billy Penn</span>,{" "}
        <span className="text-foreground">PhillyVoice</span>,{" "}
        <span className="text-foreground">Philadelphia Tribune</span>, and{" "}
        <span className="text-foreground">The Philadelphia Citizen</span>
      </p>
      <p className="font-serif italic">
        Click any headline to read the full story at its source.
      </p>
    </footer>
  );
}
