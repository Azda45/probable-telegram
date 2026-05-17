"use client";

type AlertSoundId = "default";

const ALERT_SOURCES: Record<AlertSoundId, string> = {
  default: "/cutCaching.mp3",
};

const AUDIO_POOL_SIZE = 4;
const DEBUG_AUDIO = true;

function logAudio(message: string, data?: Record<string, unknown>) {
  if (!DEBUG_AUDIO) return;
  console.debug(`[alert-audio] ${message}`, data || "");
}

interface HtmlAudioCacheEntry {
  elements: HTMLAudioElement[];
  nextIndex: number;
  ready: boolean;
}

class AlertAudioManager {
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
    if (cached) {
      logAudio("html cache hit", { sound, ready: cached.ready, poolSize: cached.elements.length });
      return cached;
    }

    logAudio("html cache miss; creating audio pool", { sound, src: ALERT_SOURCES[sound], poolSize: AUDIO_POOL_SIZE });
    const elements = Array.from({ length: AUDIO_POOL_SIZE }, () => {
      const audio = new Audio(ALERT_SOURCES[sound]);
      audio.preload = "auto";
      audio.volume = 1;
      audio.load();
      return audio;
    });

    const entry: HtmlAudioCacheEntry = { elements, nextIndex: 0, ready: false };
    elements[0].addEventListener(
      "canplaythrough",
      () => {
        entry.ready = true;
        logAudio("html audio ready", { sound, readyState: elements[0].readyState });
      },
      { once: true }
    );
    elements[0].addEventListener(
      "error",
      () => {
        logAudio("html audio preload error", { sound, error: elements[0].error?.message, code: elements[0].error?.code });
      },
      { once: true }
    );

    this.htmlCache.set(sound, entry);
    return entry;
  }

  async preload(sound: AlertSoundId = "default") {
    this.ensureHtmlCache(sound);
    if (this.buffers.has(sound)) {
      logAudio("webaudio buffer cache hit", { sound });
      return this.buffers.get(sound)!;
    }
    if (this.loading.has(sound)) {
      logAudio("webaudio buffer load already pending", { sound });
      return this.loading.get(sound)!;
    }

    const context = this.getContext();
    if (!context) throw new Error("AudioContext unavailable");

    logAudio("webaudio preload start", { sound, src: ALERT_SOURCES[sound], contextState: context.state });
    const loadPromise = fetch(ALERT_SOURCES[sound], { cache: "force-cache" })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to preload alert sound: ${res.status}`);
        logAudio("webaudio fetch success", { sound, status: res.status });
        return res.arrayBuffer();
      })
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this.buffers.set(sound, buffer);
        this.loading.delete(sound);
        logAudio("webaudio decode success", { sound, duration: buffer.duration, sampleRate: buffer.sampleRate });
        return buffer;
      })
      .catch((error) => {
        this.loading.delete(sound);
        logAudio("webaudio preload failed", { sound, error: error instanceof Error ? error.message : String(error) });
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
    logAudio("unlock requested", { contextState: context.state });
    if (context.state === "suspended") await context.resume().catch((error) => {
      logAudio("AudioContext resume rejected", { error: error instanceof Error ? error.message : String(error) });
    });
    this.unlocked = context.state === "running";
    logAudio("unlock completed", { contextState: context.state, unlocked: this.unlocked });
  }

  private async playHtml(sound: AlertSoundId = "default") {
    const entry = this.ensureHtmlCache(sound);
    const audio = entry.elements[entry.nextIndex];
    entry.nextIndex = (entry.nextIndex + 1) % entry.elements.length;

    logAudio("html play called", {
      sound,
      poolIndex: entry.nextIndex,
      readyState: audio.readyState,
      paused: audio.paused,
      ended: audio.ended,
      currentTime: audio.currentTime,
      networkState: audio.networkState,
      errorCode: audio.error?.code,
    });

    try {
      audio.pause();
      audio.currentTime = 0;
      await audio.play();
      logAudio("html playback started", { sound, readyState: audio.readyState });
    } catch (error) {
      logAudio("html playback failed", { sound, error: error instanceof Error ? error.message : String(error) });
      throw error;
    }
  }

  private async playWebAudio(sound: AlertSoundId = "default") {
    const context = this.getContext();
    if (!context) throw new Error("AudioContext unavailable");

    if (context.state === "suspended") {
      await context.resume().catch(() => undefined);
    }

    logAudio("webaudio play called", { sound, contextState: context.state, cacheHit: this.buffers.has(sound) });

    if (context.state !== "running") {
      throw new Error(`AudioContext not running (${context.state})`);
    }

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
      logAudio("webaudio playback ended", { sound, activeSources: this.activeSources.size });
    };

    this.activeSources.add(source);
    source.start(0);
    logAudio("webaudio source started", { sound, activeSources: this.activeSources.size });
  }

  async play(sound: AlertSoundId = "default") {
    logAudio("play requested", { sound });

    // HTMLAudioElement is the primary path for OBS browser source compatibility.
    // WebAudio remains as fallback and still caches only AudioBuffer, never source nodes.
    try {
      await this.playHtml(sound);
      return;
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
    logAudio("stopped all alert sounds");
  }

  destroy() {
    this.stopAll();
    this.buffers.clear();
    this.loading.clear();
    this.htmlCache.clear();
    if (this.context && this.context.state !== "closed") {
      this.context.close().catch(() => undefined);
    }
    this.context = null;
    this.unlocked = false;
  }

  get isUnlocked() {
    return this.unlocked || this.context?.state === "running";
  }
}

const alertAudioManager = new AlertAudioManager();

export function preloadAlertSounds() {
  return alertAudioManager.preloadAll();
}

export function unlockAlertAudio() {
  return alertAudioManager.unlock();
}

export function playNotificationSound(sound: string = "default"): Promise<void> {
  if (sound === "none") return Promise.resolve();
  return alertAudioManager.play("default");
}

export function stopAlertSounds() {
  alertAudioManager.stopAll();
}

export function destroyAlertAudio() {
  alertAudioManager.destroy();
}

export function isAlertAudioUnlocked() {
  return alertAudioManager.isUnlocked;
}
