import { registerPlugin, type PluginListenerHandle } from '@capacitor/core';

export interface QuickCartNativeItem { name: string; qty: number }

export interface QuickCartProgressEvent { index: number; total: number; ok: boolean; note: string }

export interface AuraCartAssistantPlugin {
  startQuickCart(options: { platform: string; items: QuickCartNativeItem[] }): Promise<{ started: boolean }>;
  addListener(eventName: 'quickCartProgress', listenerFunc: (data: QuickCartProgressEvent) => void): Promise<PluginListenerHandle>;
  addListener(eventName: 'quickCartDone', listenerFunc: () => void): Promise<PluginListenerHandle>;
}

/**
 * Native (Android/iOS) counterpart to the browser extension's Quick Cart —
 * see android/app/src/main/java/com/aura/app/AuraCartAssistantPlugin.java.
 * On web (no native platform), this resolves to Capacitor's web stub, which
 * rejects every call; callers should check Capacitor.isNativePlatform() (or
 * just try the browser-extension path) before using it.
 */
export const AuraCartAssistant = registerPlugin<AuraCartAssistantPlugin>('AuraCartAssistant');
