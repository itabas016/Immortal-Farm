
import { LandPlot, PlayerState, Language } from '../types';

const STORAGE_KEY = 'spirit_farm_seal';
const SALT = 42;

export function seal(data: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(data);
  const shifted = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    shifted[i] = bytes[i] ^ SALT;
  }
  let binary = '';
  for (let i = 0; i < shifted.byteLength; i++) {
    binary += String.fromCharCode(shifted[i]);
  }
  return btoa(binary);
}

export function unseal(sealed: string): string {
  try {
    const binary = atob(sealed);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i) ^ SALT;
    }
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
  } catch (e) {
    console.error("Seal broken!", e);
    return "";
  }
}

interface GameState {
  plots: LandPlot[];
  player: PlayerState;
  language: Language;
  lastSave: number;
}

export function saveGame(state: GameState) {
  try {
    const json = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, seal(json));
  } catch (e) {
    console.error("Failed to save progress", e);
  }
}

export function loadGame(): GameState | null {
  const sealed = localStorage.getItem(STORAGE_KEY);
  if (!sealed) return null;
  const json = unseal(sealed);
  if (!json) return null;
  try {
    return JSON.parse(json) as GameState;
  } catch (e) {
    return null;
  }
}
