import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aura.app',
  appName: 'AURA',
  webDir: 'dist',
  // Dev: the backend is plain http on the LAN, so the app must load over http too (https pages block http calls).
  server: { androidScheme: 'http', cleartext: true },
};

export default config;
