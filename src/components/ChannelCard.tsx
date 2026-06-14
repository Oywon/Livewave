import { Play } from "lucide-react";
import type { Channel } from "@/lib/playlist.functions";

const GRADIENTS = [
  "from-rose-500 to-orange-500",
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-rose-500",
  "from-cyan-500 to-blue-600",
  "from-pink-500 to-purple-600",
];

function initials(name: string) {
  const cleaned = name.replace(/[^\p{L}\p{N}\s]/gu, " ").trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "TV";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function gradientFor(name: string) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return GRADIENTS[sum % GRADIENTS.length];
}

function stripFlags(name: string) {
  return name.replace(/\p{Extended_Pictographic}/gu, "").trim();
}

type Props = {
  channel: Channel;
  active: boolean;
  onSelect: (c: Channel) => void;
};

export function ChannelCard({ channel, active, onSelect }: Props) {
  const display = stripFlags(channel.name) || channel.name;
  const grad = gradientFor(channel.name);

  return (
    <button
      onClick={() => onSelect(channel)}
      className={`group relative flex w-[180px] shrink-0 flex-col overflow-hidden rounded-xl border bg-card text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_18px_40px_-12px_oklch(0.62_0.24_27/35%)] sm:w-[200px] ${
        active ? "border-primary ring-2 ring-primary/40" : "border-border"
      }`}
    >
      <div
        className={`relative flex aspect-video items-center justify-center bg-gradient-to-br ${grad}`}
      >
        {channel.logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={channel.logo}
            alt=""
            className="h-12 w-12 object-contain"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <span className="font-display text-3xl tracking-wider text-white drop-shadow">
            {initials(display)}
          </span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Play className="h-5 w-5" />
          </div>
        </div>
        {channel.quality && (
          <span className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">
            {channel.quality}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-0.5 px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-foreground">{display}</p>
        <p className="truncate text-xs text-muted-foreground">
          {channel.country || channel.group}
        </p>
      </div>
    </button>
  );
}
