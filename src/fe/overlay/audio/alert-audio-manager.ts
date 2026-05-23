"use client";

export type AlertSoundId = "default";

const ALERT_SOURCES: Record<AlertSoundId, string> = {
  default: "/cutCaching.mp3",
};

const AUDIO_POOL_SIZE = 4;
const DEBUG_AUDIO = false;

function logAudio(message: string, data?: Record<string, unknown>) {
  if (!DEBUG_AUDIO) return;
  console.debug(`[alert-audio] ${message}`, data || "");
}

interface HtmlAudioCacheEntry {
  elements: HTMLAudioElement[];
  nextIndex: number;
  ready: boolean;
}

export class AlertAudioManager {
  private context: AudioContext | null = null;
  private buffers = new Map<AlertSoundId, AudioBuffer>();
  private loading = new Map<AlertSoundId, Promise<AudioBuffer>>();
  private htmlCache = new Map<AlertSoundId, HtmlAudioCacheEntry>();
  private activeSources = new Set<AudioBufferSourceNode>();
  private unlocked = false;

  private getContext() {
    if (typeof window === "undefined") return null;
    if (!this.context) {
      this.context = new AudioContext({ latencyHint: "interactive" });
      logAudio("created AudioContext", { state: this.context.state });
    }
    return this.context;
  }

  private ensureHtmlCache(sound: AlertSoundId = "default") {
    const cached = this.htmlCache.get(sound);
    if (cached) return cached;

    const elements = Array.from({ length: AUDIO_POOL_SIZE }, () => {
      const audio = new Audio(ALERT_SOURCES[sound]);
      audio.preload = "auto";
      audio.volume = 1;
      audio.load();
      return audio;
    });

    const entry: HtmlAudioCacheEntry = { elements, nextIndex: 0, ready: false };
    elements[0].addEventListener("canplaythrough", () => { entry.ready = true; }, { once: true });
    elements[0].addEventListener("error", () => {
      logAudio("html audio preload error", { sound, error: elements[0].error?.message, code: elements[0].error?.code });
    }, { once: true });

    this.htmlCache.set(sound, entry);
    return entry;
  }

  async preload(sound: AlertSoundId = "default") {
    this.ensureHtmlCache(sound);
    if (this.buffers.has(sound)) return this.buffers.get(sound)!;
    if (this.loading.has(sound)) return this.loading.get(sound)!;

    const context = this.getContext();
    if (!context) throw new Error("AudioContext unavailable");

    const loadPromise = fetch(ALERT_SOURCES[sound], { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to preload alert sound: ${res.status}`);
        return res.arrayBuffer();
      })
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this.buffers.set(sound, buffer);
        this.loading.delete(sound);
        return buffer;
      })
      .catch((error) => {
        this.loading.delete(sound);
        throw error;
      });

    this.loading.set(sound, loadPromise);
    return loadPromise;
  }

  async preloadAll() {
    await Promise.allSettled(Object.keys(ALERT_SOURCES).map((sound) => this.preload(sound as AlertSoundId)));
  }

  async unlock() {
    this.ensureHtmlCache("default");
    const context = this.getContext();
    if (!context) return;
    if (context.state === "suspended") await context.resume().catch((error) => {
      logAudio("AudioContext resume rejected", { error: error instanceof Error ? error.message : String(error) });
    });
    this.unlocked = context.state === "running";
  }

  private async playHtml(sound: AlertSoundId = "default") {
    const entry = this.ensureHtmlCache(sound);
    const audio = entry.elements[entry.nextIndex];
    entry.nextIndex = (entry.nextIndex + 1) % entry.elements.length;

    audio.pause();
    audio.currentTime = 0;
    await audio.play();
  }

  private async playWebAudio(sound: AlertSoundId = "default") {
    const context = this.getContext();
    if (!context) throw new Error("AudioContext unavailable");
    if (context.state === "suspended") await context.resume().catch(() => undefined);
    if (context.state !== "running") throw new Error(`AudioContext not running (${context.state})`);

    const buffer = this.buffers.get(sound) || await this.preload(sound);
    const source = context.createBufferSource();
    const gain = context.createGain();

    source.buffer = buffer;
    gain.gain.value = 1;
    source.connect(gain);
    gain.connect(context.destination);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      this.activeSources.delete(source);
    };

    this.activeSources.add(source);
    source.start(0);
  }

  async play(sound: AlertSoundId = "default") {
    try {
      await this.playHtml(sound);
    } catch {
      await this.playWebAudio(sound).catch((error) => {
        logAudio("all playback paths failed", { sound, error: error instanceof Error ? error.message : String(error) });
      });
    }
  }

  stopAll() {
    for (const source of this.activeSources) {
      try {
        source.stop();
      } catch {
        // Already stopped.
      }
    }
    this.activeSources.clear();
    for (const entry of this.htmlCache.values()) {
      for (const audio of entry.elements) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }

  destroy() {
    this.stopAll();
    this.buffers.clear();
    this.loading.clear();
    this.htmlCache.clear();
    if (this.context && this.context.state !== "closed") this.context.close().catch(() => undefined);
    this.context = null;
    this.unlocked = false;
  }

  get isUnlocked() {
    return this.unlocked || this.context?.state === "running";
  }
}
