import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Radio } from "lucide-react";
import type { Channel } from "@/lib/playlist.functions";

type Props = {
  channel: Channel | null;
};

export function VideoPlayer({ channel }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) return;

    setError(null);
    setLoading(true);

    // teardown previous
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const url = channel.url;
    const isM3U8 = /\.m3u8(\?|$)/i.test(url);

    const onPlaying = () => {
      setLoading(false);
      setPlaying(true);
    };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setLoading(true);
    video.addEventListener("playing", onPlaying);
    video.addEventListener("pause", onPause);
    video.addEventListener("waiting", onWaiting);

    if (isM3U8 && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hlsRef.current = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) {
          setError("Stream unavailable. Try another channel.");
          setLoading(false);
        }
      });
    } else {
      video.src = url;
      video.play().catch(() => {});
    }

    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("waiting", onWaiting);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
    >
      <video
        ref={videoRef}
        className="h-full w-full bg-black object-contain"
        playsInline
        autoPlay
        muted={muted}
      />

      {!channel && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <Radio className="mx-auto mb-3 h-10 w-10 opacity-50" />
            <p className="font-display text-2xl tracking-wide">Pick a channel to start watching</p>
          </div>
        </div>
      )}

      {channel && (
        <>
          {/* Top gradient with channel info */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/80 via-black/30 to-transparent p-4 sm:p-6">
            <div className="min-w-0">
              <div className="mb-1 flex items-center gap-2">
                <span className="inline-flex h-2 w-2 rounded-full bg-[var(--color-live)] live-pulse" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/90">
                  Live
                </span>
                {channel.quality && (
                  <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur">
                    {channel.quality}
                  </span>
                )}
              </div>
              <h2 className="truncate font-display text-2xl tracking-wide text-white sm:text-3xl">
                {channel.name}
              </h2>
              <p className="text-xs text-white/70 sm:text-sm">
                {channel.group}
                {channel.country ? ` · ${channel.country}` : ""}
              </p>
            </div>
          </div>

          {/* Loading / error overlay */}
          {(loading || error) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              {error ? (
                <p className="rounded-lg bg-black/60 px-4 py-2 text-sm text-white">{error}</p>
              ) : (
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
            </div>
          )}

          {/* Bottom controls */}
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100 sm:p-6">
            <button
              onClick={togglePlay}
              className="rounded-full bg-white/15 p-2.5 text-white backdrop-blur transition hover:bg-white/25"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={toggleMute}
              className="rounded-full bg-white/15 p-2.5 text-white backdrop-blur transition hover:bg-white/25"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            <div className="flex-1" />
            <button
              onClick={toggleFullscreen}
              className="rounded-full bg-white/15 p-2.5 text-white backdrop-blur transition hover:bg-white/25"
              aria-label="Fullscreen"
            >
              <Maximize className="h-5 w-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
