import { Capacitor } from '@capacitor/core';
import { createStore, uid } from '../state/store';
import { AuraCartAssistant } from '../native/cartAssistant';

export type QuickCartPlatform = 'blinkit' | 'zepto' | 'instamart';
export interface QuickCartItem { name: string; qty: number }

export const PLATFORM_LABEL: Record<QuickCartPlatform, string> = {
  blinkit: 'Blinkit',
  zepto: 'Zepto',
  instamart: 'Swiggy Instamart',
};

const isNative = Capacitor.isNativePlatform();

/**
 * Whether Quick Cart is available. On native (Android/iOS) it's always
 * available — the automation is compiled into the app (see
 * android/app/src/main/java/com/aura/app/AuraCartAssistantPlugin.java). On
 * web it depends on whether the AURA Cart Assistant browser extension's
 * bridge content script has announced itself (see browser-extension/).
 */
export const extensionStore = createStore<{ installed: boolean }>({ installed: isNative });

export interface QuickCartState {
  status: 'idle' | 'running' | 'done' | 'error';
  platform?: QuickCartPlatform;
  index: number;
  total: number;
  message: string;
}
export const quickCartStore = createStore<QuickCartState>({ status: 'idle', index: 0, total: 0, message: '' });

let activeRequestId: string | null = null;

if (isNative) {
  void AuraCartAssistant.addListener('quickCartProgress', ({ index, total, ok, note }) => {
    quickCartStore.set((s) => ({
      ...s,
      status: 'running',
      index,
      total,
      message: ok ? `Added ${index + 1}/${total} items…` : `Item ${index + 1}/${total} needs a manual add: ${note || 'not found'}`,
    }));
  });
  void AuraCartAssistant.addListener('quickCartDone', () => {
    quickCartStore.set((s) => ({ ...s, status: 'done', message: 'Done — tap "Review & pay" in the assistant to finish in the real app.' }));
  });
} else if (typeof window !== 'undefined') {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const msg = event.data as { source?: string; type?: string; requestId?: string; ok?: boolean; error?: string; index?: number; total?: number; note?: string };
    if (!msg || msg.source !== 'aura-extension') return;

    if (msg.type === 'AURA_EXTENSION_READY') {
      extensionStore.set({ installed: true });
      return;
    }
    if (!msg.requestId || msg.requestId !== activeRequestId) return;

    if (msg.type === 'AURA_QUICK_CART_ACK' && !msg.ok) {
      quickCartStore.set((s) => ({ ...s, status: 'error', message: msg.error ?? 'Could not start the cart assistant.' }));
      activeRequestId = null;
    } else if (msg.type === 'QUICK_CART_PROGRESS') {
      const index = msg.index ?? 0;
      const total = msg.total ?? 0;
      quickCartStore.set((s) => ({
        ...s,
        status: 'running',
        index,
        total,
        message: msg.ok ? `Added ${index + 1}/${total} items…` : `Item ${index + 1}/${total} needs a manual add: ${msg.note ?? 'not found'}`,
      }));
    } else if (msg.type === 'QUICK_CART_DONE') {
      quickCartStore.set((s) => ({ ...s, status: 'done', message: 'Done — open your cart to review and pay. AURA never pays for you.' }));
      activeRequestId = null;
    }
  });
}

export function isExtensionInstalled(): boolean {
  return extensionStore.get().installed;
}

/**
 * Starts filling the cart on the given platform. On native, runs the
 * built-in in-app WebView automation; on web, requires the AURA Cart
 * Assistant browser extension.
 */
export function startQuickCart(platform: QuickCartPlatform, items: QuickCartItem[]) {
  if (!items.length) return;

  if (isNative) {
    quickCartStore.set({ status: 'running', platform, index: 0, total: items.length, message: `Opening ${PLATFORM_LABEL[platform]}…` });
    AuraCartAssistant.startQuickCart({ platform, items }).catch((e: unknown) => {
      quickCartStore.set((s) => ({ ...s, status: 'error', message: e instanceof Error ? e.message : 'Could not start the cart assistant.' }));
    });
    return;
  }

  if (!extensionStore.get().installed) {
    quickCartStore.set({ status: 'error', platform, index: 0, total: items.length, message: 'Install the AURA Cart Assistant browser extension first (see browser-extension/README.md).' });
    return;
  }
  const requestId = uid('qc');
  activeRequestId = requestId;
  quickCartStore.set({ status: 'running', platform, index: 0, total: items.length, message: `Opening ${PLATFORM_LABEL[platform]}…` });
  window.postMessage({ source: 'aura-web', type: 'AURA_QUICK_CART_START', requestId, platform, items }, '*');
}

/**
 * Parses a free-text shopping list into items, e.g. "milk x2, eggs, 3x bread"
 * -> [{name:'milk',qty:2},{name:'eggs',qty:1},{name:'bread',qty:3}].
 */
export function parseShoppingList(text: string): QuickCartItem[] {
  return text
    .split(/,|\band\b|\n/i)
    .map((raw) => raw.trim())
    .filter(Boolean)
    .map((raw) => {
      const trailing = raw.match(/^(.*?)\s*[x×]\s*(\d+)$/i);
      const leading = raw.match(/^(\d+)\s*[x×]\s*(.*)$/i);
      if (trailing) return { name: trailing[1].trim(), qty: Math.max(1, parseInt(trailing[2], 10)) };
      if (leading) return { name: leading[2].trim(), qty: Math.max(1, parseInt(leading[1], 10)) };
      return { name: raw, qty: 1 };
    })
    .filter((item) => item.name.length > 0);
}
