import { Search, Tv, X } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (v: string) => void;
  groups: string[];
  activeGroup: string | null;
  onGroupSelect: (g: string | null) => void;
};

export function AppHeader({
  query,
  onQueryChange,
  groups,
  activeGroup,
  onGroupSelect,
}: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:gap-6 sm:px-8 sm:py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Tv className="h-5 w-5" />
          </div>
          <span className="hidden font-display text-2xl tracking-[0.18em] text-foreground sm:inline">
            LIVEWAVE
          </span>
        </div>

        <div className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search channels…"
            className="w-full rounded-full border border-border bg-input/60 py-2 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {query && (
            <button
              onClick={() => onQueryChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 pb-3 sm:px-8">
        <button
          onClick={() => onGroupSelect(null)}
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
            activeGroup === null
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => onGroupSelect(g)}
            className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
              activeGroup === g
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </header>
  );
}
