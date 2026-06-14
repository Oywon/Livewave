import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPlaylist, type Channel } from "@/lib/playlist.functions";
import { VideoPlayer } from "@/components/VideoPlayer";
import { CategoryRow } from "@/components/CategoryRow";
import { AppHeader } from "@/components/AppHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LiveWave — Stream Live Sports & TV Channels" },
      {
        name: "description",
        content:
          "Watch live sports and TV channels in a clean, cinematic player. Browse categories, search, and stream instantly.",
      },
      { property: "og:title", content: "LiveWave — Live Sports & TV" },
      {
        property: "og:description",
        content: "Cinematic IPTV viewer with categorized live channels and instant HLS playback.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["playlist"],
    queryFn: () => getPlaylist(),
    staleTime: 1000 * 60 * 5,
  });

  const [active, setActive] = useState<Channel | null>(null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<string | null>(null);

  const channels = data ?? [];

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = channels.filter((c) => {
      if (group && c.group !== group) return false;
      if (q && !c.name.toLowerCase().includes(q)) return false;
      return true;
    });
    const map = new Map<string, Channel[]>();
    for (const c of filtered) {
      const arr = map.get(c.group) ?? [];
      arr.push(c);
      map.set(c.group, arr);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [channels, query, group]);

  const allGroups = useMemo(() => {
    const set = new Set<string>();
    for (const c of channels) set.add(c.group);
    return Array.from(set).sort();
  }, [channels]);

  // Auto-pick first channel once loaded
  if (!active && channels.length > 0) {
    setActive(channels[0]);
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        query={query}
        onQueryChange={setQuery}
        groups={allGroups}
        activeGroup={group}
        onGroupSelect={setGroup}
      />

      <main className="space-y-10 pb-16 pt-6 sm:pt-10">
        <section className="px-4 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <VideoPlayer channel={active} />
          </div>
        </section>

        {isLoading && (
          <div className="px-4 sm:px-8">
            <div className="flex h-40 items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
              Loading channels…
            </div>
          </div>
        )}

        {isError && (
          <div className="px-4 sm:px-8">
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
              <p className="font-display text-2xl tracking-wide text-foreground">
                Couldn't load the playlist
              </p>
              <p className="text-sm text-muted-foreground">
                The channel source might be down. Try again in a moment.
              </p>
              <button
                onClick={() => refetch()}
                className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!isLoading && !isError && grouped.length === 0 && (
          <div className="px-4 sm:px-8">
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              No channels match your search.
            </div>
          </div>
        )}

        <div className="space-y-10">
          {grouped.map(([name, list]) => (
            <CategoryRow
              key={name}
              title={name}
              channels={list}
              activeId={active?.id ?? null}
              onSelect={setActive}
            />
          ))}
        </div>
      </main>

      <footer className="border-t border-border/60 px-4 py-6 text-center text-xs text-muted-foreground sm:px-8">
        LiveWave · Channel data from public FIFA-LiveTV playlist
      </footer>
    </div>
  );
}
