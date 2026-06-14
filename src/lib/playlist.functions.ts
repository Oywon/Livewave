import { createServerFn } from "@tanstack/react-start";

export type Channel = {
  id: string;
  number: number;
  name: string;
  url: string;
  group: string;
  country?: string;
  quality?: string;
  logo?: string;
  host: string;
};

const PLAYLIST_URL =
  "https://raw.githubusercontent.com/HasanC14/FIFA-LiveTV/main/Fifa%20world%20cup.m3u";

const BD_PLAYLIST_URL = "https://iptv-org.github.io/iptv/countries/bd.m3u";


const countryNames: Record<string, string> = {
  "🇦🇱": "Albania",
  "🇦🇷": "Argentina",
  "🇦🇹": "Austria",
  "🇧🇬": "Bulgaria",
  "🇧🇷": "Brazil",
  "🇨🇱": "Chile",
  "🇨🇴": "Colombia",
  "🇨🇿": "Czechia",
  "🇩🇪": "Germany",
  "🇪🇸": "Spain",
  "🇫🇷": "France",
  "🇬🇧": "United Kingdom",
  "🇭🇰": "Hong Kong",
  "🇭🇺": "Hungary",
  "🇮🇳": "India",
  "🇮🇱": "Israel",
  "🇮🇹": "Italy",
  "🇲🇴": "Macau",
  "🇲🇽": "Mexico",
  "🇳🇱": "Netherlands",
  "🇳🇴": "Norway",
  "🇵🇹": "Portugal",
  "🇶🇦": "Qatar",
  "🇷🇴": "Romania",
  "🇷🇺": "Russia",
  "🇸🇦": "Saudi Arabia",
  "🇹🇲": "Turkmenistan",
  "🇹🇷": "Turkey",
  "🇺🇦": "Ukraine",
  "🇺🇸": "USA",
};

const groupPatterns: Array<[RegExp, string]> = [
  [/^(AR\s*\||.*\bARG\b|.*Argentina|.*🇦🇷)/i, "Argentina"],
  [/^(MX\s*\||.*Mexico|.*🇲🇽)/i, "Mexico"],
  [/^(USA\s*\||.*NBC|.*NBA|.*Fox Soccer|.*Universo)/i, "USA"],
  [/Latino|TUDN|Claro|Telemundo|Azteca|Win Sports|TyC|Tigo/i, "Latino"],
  [/ESPN/i, "ESPN"],
  [/FOX/i, "Fox"],
  [/beIN|BEIN/i, "beIN"],
  [/DAZN/i, "DAZN"],
  [/SKY|Sky/i, "Sky"],
  [/Матч|Setanta|OTT|🇷🇺/i, "Eastern Europe"],
  [/SPORT|Sports|Sport|Deportes|Futbol|Football|Golf|Liga|LALIGA/i, "Sports"],
];

function detectGroup(name: string): string {
  for (const [pattern, group] of groupPatterns) {
    if (pattern.test(name)) return group;
  }
  return "Other";
}

function detectCountry(name: string): string | undefined {
  for (const [flag, country] of Object.entries(countryNames)) {
    if (name.includes(flag)) return country;
  }
  return undefined;
}

function detectQuality(name: string): string | undefined {
  const m = name.match(/\b(4K|UHD|FHD|1080p?|720p?|HD|SD)\b/i);
  return m ? m[1].toUpperCase() : undefined;
}

function attr(line: string, key: string): string | undefined {
  const re = new RegExp(`${key}="([^"]*)"`, "i");
  const m = line.match(re);
  return m ? m[1] : undefined;
}

function parseM3U(text: string): Channel[] {
  const lines = text.split(/\r?\n/);
  const channels: Channel[] = [];
  let counter = 0;
  let pendingInfo: string | null = null;
  let pendingName: string | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith("#EXTM3U")) continue;
    if (line.startsWith("#EXTINF")) {
      pendingInfo = line;
      const commaIdx = line.indexOf(",");
      pendingName = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : "Unknown";
      continue;
    }
    if (line.startsWith("#")) continue;
    if (!pendingInfo || !pendingName) continue;

    const url = line;
    let host = "";
    try {
      host = new URL(url).host;
    } catch {
      host = "unknown";
    }

    counter += 1;
    const logo = attr(pendingInfo, "tvg-logo");
    const tvgId = attr(pendingInfo, "tvg-id");
    const groupTitle = attr(pendingInfo, "group-title");
    const detected = detectGroup(pendingName);
    const group = groupTitle && groupTitle.length > 0 ? groupTitle : detected;

    channels.push({
      id: `${tvgId || pendingName}-${counter}`,
      number: counter,
      name: pendingName,
      url,
      group,
      country: detectCountry(pendingName),
      quality: detectQuality(pendingName),
      logo,
      host,
    });

    pendingInfo = null;
    pendingName = null;
  }

  return channels;
}

async function fetchM3U(url: string): Promise<Channel[]> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];
    return parseM3U(await res.text());
  } catch {
    return [];
  }
}

export const getPlaylist = createServerFn({ method: "GET" }).handler(
  async (): Promise<Channel[]> => {
    const [fifa, bd] = await Promise.all([
      fetchM3U(PLAYLIST_URL),
      fetchM3U(BD_PLAYLIST_URL),
    ]);
    // Force Bangladesh channels into their own group with country tagged
    const bdTagged = bd.map((c) => ({
      ...c,
      group: "Bangladesh",
      country: c.country ?? "Bangladesh",
    }));
    const merged = [...bdTagged, ...fifa];
    // Renumber so IDs/numbers are unique
    return merged.map((c, i) => ({ ...c, number: i + 1, id: `${c.id}-${i}` }));
  },
);
