import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Channel } from "@/lib/playlist.functions";
import { ChannelCard } from "./ChannelCard";

type Props = {
  title: string;
  channels: Channel[];
  activeId: string | null;
  onSelect: (c: Channel) => void;
};

export function CategoryRow({ title, channels, activeId, onSelect }: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  if (channels.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4 px-4 sm:px-8">
        <div>
          <h3 className="font-display text-2xl tracking-wide text-foreground sm:text-3xl">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground">{channels.length} channels</p>
        </div>
        <div className="hidden gap-1 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            className="rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            className="rounded-full border border-border bg-card p-2 text-muted-foreground transition hover:border-primary/60 hover:text-foreground"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Desktop: horizontal scroll. Mobile: 2-col grid */}
      <div
        ref={scrollerRef}
        className="no-scrollbar hidden gap-3 overflow-x-auto px-4 pb-2 sm:flex sm:gap-4 sm:px-8"
      >
        {channels.map((c) => (
          <ChannelCard
            key={c.id}
            channel={c}
            active={activeId === c.id}
            onSelect={onSelect}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 sm:hidden">
        {channels.map((c) => (
          <div key={c.id} className="w-full">
            <div className="w-full [&>button]:!w-full">
              <ChannelCard channel={c} active={activeId === c.id} onSelect={onSelect} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
