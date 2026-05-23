"use client";

import { AlertAudioManager } from "../audio/alert-audio-manager";

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
